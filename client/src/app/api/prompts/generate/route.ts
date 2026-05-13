import { NextRequest, NextResponse } from 'next/server';
import { generatePromptCandidates } from '@/lib/services/aiService';
import { generatePromptRequestSchema } from '@/lib/schemas/promptSchema';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = generatePromptRequestSchema.parse(body);
    const data = await generatePromptCandidates(validatedData);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') } },
        { status: 400 }
      );
    }
    console.error('[generate] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'AI_SERVICE_ERROR', message: '프롬프트 생성 중 내부 서버 오류가 발생했습니다.', details: error instanceof Error ? error.message : String(error) } },
      { status: 500 }
    );
  }
}
