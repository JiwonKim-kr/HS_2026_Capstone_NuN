import { NextRequest, NextResponse } from 'next/server';
import { generatePromptCandidates } from '@/lib/services/aiService';
import { generatePromptRequestSchema } from '@/lib/schemas/promptSchema';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { checkGenerationLimit } from '@/lib/services/usageService';
import { z } from 'zod';

const generateRequestBodySchema = generatePromptRequestSchema.omit({ userId: true });

export async function POST(req: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { allowed, dailyCount, limit } = await checkGenerationLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DAILY_LIMIT_EXCEEDED',
          message: `일일 프롬프트 생성 한도(${limit}회)를 초과했습니다. 내일 다시 이용해주세요.`,
          dailyCount,
          limit,
        },
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const validatedBody = generateRequestBodySchema.parse(body);
    const data = await generatePromptCandidates({ ...validatedBody, userId: user.id });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: err.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') } },
        { status: 400 }
      );
    }
    console.error('[generate] Error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'AI_SERVICE_ERROR', message: '프롬프트 생성 중 내부 서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
