import { NextResponse, NextRequest } from 'next/server';

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

    const EXPRESS_API_URL = process.env.EXPRESS_API_URL || 'http://localhost:5001';
    const res = await fetch(`${EXPRESS_API_URL}/api/prompts/history/detail/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('History Detail API Route Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history details' },
      { status: 500 }
    );
  }
}
