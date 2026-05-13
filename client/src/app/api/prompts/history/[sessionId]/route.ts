import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/services/historyService';

export async function DELETE(
  request: Request,
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

    const result = await deleteSession(sessionId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('History Delete API Route Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete history' },
      { status: 500 }
    );
  }
}
