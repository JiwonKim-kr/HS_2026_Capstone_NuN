import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 인증이 필요한 경로 패턴 (/onboarding은 회원가입 직후 세션 없이 접근 가능해야 하므로 제외)
const PROTECTED_PAGE_PATHS = ["/dashboard", "/profile"];
const PROTECTED_API_PATHS = ["/api/prompts", "/api/mcp-keys", "/api/user"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = PROTECTED_PAGE_PATHS.some((p) => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtectedPage && !isProtectedApi) return NextResponse.next();

  const response = NextResponse.next();

  // Supabase SSR 클라이언트 생성 (미들웨어용)
  // 미들웨어는 getSession()으로 충분 — 리다이렉트/차단 목적이며, 실제 권한 검증은 각 API 라우트에서 getUser()로 수행
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    if (isProtectedApi) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 페이지: 로그인 페이지로 리다이렉트
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/api/prompts/:path*", "/api/mcp-keys/:path*", "/api/user/:path*"],
};
