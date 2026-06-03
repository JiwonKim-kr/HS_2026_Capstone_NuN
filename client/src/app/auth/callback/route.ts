import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin: requestOrigin } = new URL(request.url);
  // 리버스 프록시 환경에서 request.url이 localhost로 잡히는 것을 방지
  const origin = process.env.NEXT_PUBLIC_SITE_URL || requestOrigin;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth_callback_error`);
  }

  const supabase = await createRouteHandlerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    // 신규 가입 첫 교환에서 실패하면 로그인 화면으로 퇴출된다. 원인 표면화를 위해 로깅.
    console.error('[auth/callback] exchangeCodeForSession 실패:', error?.message ?? 'no user', error);
    return NextResponse.redirect(`${origin}/?error=auth_callback_error`);
  }

  // 온보딩 완료 여부로 분기.
  // 주의: auth.users INSERT 시 트리거(on_auth_user_created → handle_new_user)가
  // public.users row를 자동 생성하므로 "row 존재"는 온보딩 완료 신호가 될 수 없다.
  // 실제 완료 플래그 is_onboarded 로 판별한다(온보딩 완료 시 true 세팅).
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('is_onboarded')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    console.error('[auth/callback] users.is_onboarded 조회 실패:', profileError.message, profileError);
  }
  console.log('[auth/callback] uid=%s is_onboarded=%s', data.user.id, profile?.is_onboarded);

  if (profile?.is_onboarded === true) {
    // 온보딩 완료 사용자 → 대시보드로 이동
    return NextResponse.redirect(`${origin}/dashboard`);
  }
  // 신규/미완료 사용자 → 온보딩으로 이동
  return NextResponse.redirect(`${origin}/onboarding`);
}
