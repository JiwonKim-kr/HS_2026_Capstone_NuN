import { NextRequest, NextResponse } from 'next/server';
import { processFeedback } from '@/lib/services/feedbackService';

export async function POST(req: NextRequest) {
  try {
    const { historyId, userId, appliedTiers, targetLikeStatus } = await req.json();
    if (!historyId || !userId || !appliedTiers || typeof targetLikeStatus !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields or invalid format' },
        { status: 400 }
      );
    }
    const result = await processFeedback({ historyId, userId, appliedTiers, targetLikeStatus });
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Feedback] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류' },
      { status: 500 }
    );
  }
}
