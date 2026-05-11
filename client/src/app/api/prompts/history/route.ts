import { NextResponse } from 'next/server';

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

    const EXPRESS_API_URL = process.env.EXPRESS_API_URL || 'http://localhost:5001';
    const res = await fetch(`${EXPRESS_API_URL}/api/prompts/history/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('History API Route Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
