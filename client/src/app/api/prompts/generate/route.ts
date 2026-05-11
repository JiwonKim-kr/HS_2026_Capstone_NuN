import { NextRequest, NextResponse } from 'next/server';

const EXPRESS_API_URL = process.env.EXPRESS_API_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${EXPRESS_API_URL}/api/prompts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data?.error?.message || '서버 오류' },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[Proxy] Express 서버 연결 실패:', error);
    return NextResponse.json(
      { success: false, error: '프롬프트 서버에 연결할 수 없습니다.' },
      { status: 503 }
    );
  }
}
