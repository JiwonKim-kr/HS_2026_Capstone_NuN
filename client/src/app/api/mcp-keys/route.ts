import { NextResponse } from 'next/server';
import { createRouteHandlerClient, getAuthenticatedUser } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const supabase = await createRouteHandlerClient();
  const { data, error: dbError } = await supabase
    .from('user_api_keys')
    .select('id, key_prefix, label, created_at, last_used_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (dbError) {
    console.error('[mcp-keys GET] DB error:', dbError);
    return NextResponse.json({ success: false, error: '키 목록 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    // Optional label could be passed
  }
  const label = (body as any).label || 'MCP Key';

  const rawKey = 'ptu_' + crypto.randomBytes(32).toString('hex');
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.substring(0, 8);

  const supabase = await createRouteHandlerClient();
  const { data, error: insertError } = await supabase
    .from('user_api_keys')
    .insert([
      {
        user_id: user.id,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        label,
      }
    ])
    .select('id, key_prefix, label, created_at, last_used_at')
    .single();

  if (insertError) {
    console.error('[mcp-keys POST] DB error:', insertError);
    return NextResponse.json({ success: false, error: '키 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }

  // 원본 키(rawKey)는 최초 생성 시 딱 한 번만 반환
  return NextResponse.json({ success: true, data: { ...data, rawKey } });
}
