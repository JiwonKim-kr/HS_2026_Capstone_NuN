import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { translatePromptText } from '@/lib/services/translationService';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 표시 전용 번역 프록시. 생성된 프롬프트 '원문'은 바꾸지 않고, UI에 보여줄 번역본만 반환한다.
// logId가 주어지면 번역본을 prompt_logs.translated_prompt에 저장해 두어(persist-on-view)
// 히스토리 재조회 시 재번역 없이 그대로 보여줄 수 있게 한다. (재번역 비용 절감)
// (/api/prompts/* 는 미들웨어가 인증을 강제하므로 로그인 사용자만 호출 가능)
export async function POST(req: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  try {
    const { text, targetLanguage, logId } = await req.json();

    if (typeof text !== 'string' || !text.trim() || (targetLanguage !== 'ko' && targetLanguage !== 'en')) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'text와 targetLanguage(ko|en)가 필요합니다.' } },
        { status: 400 }
      );
    }

    const translatedText = await translatePromptText(text, targetLanguage);

    // 한국어 표시 번역만 저장한다(미디어 영어 원문 → 한국어). 실패해도 응답은 정상 반환(best-effort).
    if (logId && targetLanguage === 'ko') {
      const { error: persistError } = await supabaseAdmin
        .from('prompt_logs')
        .update({ translated_prompt: translatedText })
        .eq('id', logId)
        .eq('user_id', user.id);
      if (persistError) {
        console.error('[translate] persist failed:', persistError);
      }
    }

    return NextResponse.json({ success: true, data: { translatedText } });
  } catch (err) {
    console.error('[translate] Error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'TRANSLATE_ERROR', message: '번역 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
