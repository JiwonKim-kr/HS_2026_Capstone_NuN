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

import { processFeedback } from '../services/feedbackService';
import { getUserSessions, getSessionDetails } from '../services/historyService';

router.get('/history/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ success: false, error: 'User ID is required' });
      return;
    }

    const sessions = await getUserSessions(userId as string);
    res.status(200).json({ success: true, data: sessions });
  } catch (error: any) {
    console.error('Fetch History Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/history/detail/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      res.status(400).json({ success: false, error: 'Session ID is required' });
      return;
    }

    const sessionDetails = await getSessionDetails(sessionId as string);
    if (!sessionDetails) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    res.status(200).json({ success: true, data: sessionDetails });
  } catch (error: any) {
    console.error('Fetch History Detail Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/feedback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { historyId, userId, appliedTiers, targetLikeStatus } = req.body;
    if (!historyId || !userId || !appliedTiers || typeof targetLikeStatus !== 'boolean') {
      res.status(400).json({ success: false, error: 'Missing required fields or invalid format' });
      return;
    }

    const result = await processFeedback({ historyId, userId, appliedTiers, targetLikeStatus });
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Feedback Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
