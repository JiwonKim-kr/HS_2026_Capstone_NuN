import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/services/historyService';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export async function DELETE(
  _request: Request,
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
    const result = await deleteSession(sessionId, user.id);

    if (result === null) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('History Delete API Route Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete history' },
      { status: 500 }
    );
  }
}
