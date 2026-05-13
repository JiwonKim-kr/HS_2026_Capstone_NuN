import { NextResponse, NextRequest } from 'next/server';
import { getSessionDetails } from '@/lib/services/historyService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const sessionDetails = await getSessionDetails(sessionId);
    if (!sessionDetails) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: sessionDetails });
  } catch (error) {
    console.error('History Detail API Route Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history details' },
      { status: 500 }
    );
  }
}
