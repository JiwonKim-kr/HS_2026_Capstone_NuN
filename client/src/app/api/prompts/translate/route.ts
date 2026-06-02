import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { translatePromptText } from '@/lib/services/translationService';

// 표시 전용 번역 프록시. 생성된 프롬프트 '원문'은 바꾸지 않고, UI에 보여줄 번역본만 반환한다.
// (/api/prompts/* 는 미들웨어가 인증을 강제하므로 로그인 사용자만 호출 가능)
export async function POST(req: NextRequest) {
  const { error } = await getAuthenticatedUser();
  if (error) return error;

  try {
    const { text, targetLanguage } = await req.json();

    if (typeof text !== 'string' || !text.trim() || (targetLanguage !== 'ko' && targetLanguage !== 'en')) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'text와 targetLanguage(ko|en)가 필요합니다.' } },
        { status: 400 }
      );
    }

    const translatedText = await translatePromptText(text, targetLanguage);
    return NextResponse.json({ success: true, data: { translatedText } });
  } catch (err) {
    console.error('[translate] Error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'TRANSLATE_ERROR', message: '번역 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
