import type { NextConfig } from "next";

const securityHeaders = [
  // DNS 프리페치 허용 (성능 + 보안 균형)
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // 클릭재킹 방어: 동일 출처에서만 iframe 허용
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // MIME 스니핑 방지
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer 정책: 크로스 오리진 요청 시 origin만 전달
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 카메라·마이크·위치 정보 접근 차단
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js 런타임·인라인 스크립트 허용 (개발/빌드 모두 필요)
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      // Supabase REST · WebSocket 허용
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      // iframe으로 이 페이지를 불러오는 것 완전 차단
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        // 모든 라우트에 보안 헤더 적용
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
