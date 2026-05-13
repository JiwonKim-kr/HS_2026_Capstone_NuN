import { NextResponse } from 'next/server';
import { getUserSessions } from '@/lib/services/historyService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const sessions = await getUserSessions(userId);
    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error('History API Route Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
