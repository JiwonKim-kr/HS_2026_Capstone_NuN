import { NextRequest, NextResponse } from 'next/server';
import { processFeedback } from '@/lib/services/feedbackService';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  try {
    const { historyId, appliedTiers, targetLikeStatus } = await req.json();

    if (!historyId || !appliedTiers || typeof targetLikeStatus !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields or invalid format' },
        { status: 400 }
      );
    }

    const result = await processFeedback({
      historyId,
      userId: user.id,
      appliedTiers,
      targetLikeStatus,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('[Feedback] Error:', err);
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: '접근 권한이 없습니다.' }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
