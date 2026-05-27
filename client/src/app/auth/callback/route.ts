import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth_callback_error`);
  }

  const supabase = await createRouteHandlerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/?error=auth_callback_error`);
  }

  // users 테이블 조회로 신규/기존 사용자 판별
  // 온보딩을 완료한 사용자만 users 테이블에 row가 존재한다
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', data.user.id)
    .single();

  if (existingUser) {
    // 기존 사용자 → 대시보드로 이동
    return NextResponse.redirect(`${origin}/dashboard`);
  } else {
    // 신규 구글 사용자 → 온보딩으로 이동
    return NextResponse.redirect(`${origin}/onboarding`);
  }
}
