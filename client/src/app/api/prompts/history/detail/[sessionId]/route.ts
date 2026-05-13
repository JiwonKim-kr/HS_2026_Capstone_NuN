import { NextResponse, NextRequest } from 'next/server';
import { getSessionDetails } from '@/lib/services/historyService';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'Session ID is required' },
      { status: 400 }
    );
  }

  try {
    const sessionDetails = await getSessionDetails(sessionId, user.id);

    if (!sessionDetails) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: sessionDetails });
  } catch (err) {
    console.error('History Detail API Route Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history details' },
      { status: 500 }
    );
  }
}
