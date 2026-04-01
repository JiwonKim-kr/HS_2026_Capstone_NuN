import { Router, Request, Response } from 'express';
import { generatePromptCandidates } from '../services/aiService';
import { generatePromptRequestSchema } from '../schemas/promptSchema';
import { z } from 'zod';

const router = Router();

router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Zod를 활용한 입력 파라미터 유효성 검증
    const validatedData = generatePromptRequestSchema.parse(req.body);

    // 2. AI 서비스를 통해 후보군 생성
    const response = await generatePromptCandidates(validatedData);

    // 3. 정상 응답
    res.status(200).json(response);
  } catch (error) {
    // Zod 에러 처리
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
        },
      });
      return;
    }

    // 기타 서버/AI 동작 에러 처리
    console.error('Prompt Generation Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AI_SERVICE_ERROR',
        message: '프롬프트 생성 중 내부 서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
    });
  }
});

export default router;
