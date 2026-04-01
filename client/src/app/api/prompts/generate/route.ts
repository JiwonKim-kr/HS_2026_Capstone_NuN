import { NextRequest, NextResponse } from 'next/server';
import { generatePromptRequestSchema } from '@/schemas/promptSchema';
import { generateOptimizedPrompt } from '@/services/ai/generate';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    // 1. 요청 Body 파싱
    const body = await req.json();

    // 2. Zod를 활용한 유효성 검증
    const validatedData = generatePromptRequestSchema.parse(body);

    // 3. AI 파트 (Vercel AI SDK: generateObject 실행)
    // - 비즈니스 로직 분리를 위해 Service 층 호출
    const result = await generateOptimizedPrompt(validatedData);

    // 4. 결과 반환 (이미 Schema에 맞는 JSON 형태임이 보장됨)
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    // Zod 에러 처리 (검증 실패 시)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '입력 데이터가 유효하지 않습니다.',
          details: error instanceof z.ZodError ? error.flatten().fieldErrors : undefined,
        },
        { status: 400 }
      );
    }
    
    console.error('[API] 프롬프트 생성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
