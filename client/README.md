# Prompt-U — Client

개인화 AI 프롬프트 제너레이터 **Prompt-U**의 Next.js 풀스택 앱입니다. 프론트엔드와 백엔드 API(Route Handlers)를 모두 담당합니다.

> 프로젝트 전체 개요·아키텍처·DB 스키마는 루트 [README.md](../README.md)를 참고하세요.

## 기술 스택

- **Framework**: Next.js 16 (App Router, React Compiler)
- **Language**: TypeScript 5 / React 19
- **Auth / DB**: Supabase (`@supabase/ssr` — 세션 쿠키 기반)
- **AI**: Vercel AI SDK (`ai` v6) + `@ai-sdk/anthropic` — Claude Sonnet 4.6(생성) / Haiku 4.5(분류)
- **Data**: TanStack Query · **Validation**: Zod v4 · **Styling**: Tailwind CSS v4

> API는 별도 서버 없이 이 앱의 Route Handlers(`src/app/api/**`)가 제공합니다. *(구버전의 별도 Express `server/`는 제거되었습니다.)*

## 개발 서버 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev                  # http://localhost:3000
```

스크립트: `dev` · `build` · `start` · `lint`

## 환경 변수

`.env.local`에 설정합니다.

```bash
# 공개 (클라이언트)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=          # 배포 도메인 (OAuth 콜백용, 로컬은 비워도 됨)

# 서버 전용 (절대 NEXT_PUBLIC_ 금지)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## 라우팅 구조

라우팅 정책과 레이아웃 규칙은 [ROUTING_PLAN.md](./ROUTING_PLAN.md)를 참고하세요.

## 핵심 코드

- `src/lib/services/` — 생성·학습 엔진 (`aiService`, `feedbackService`, `historyService`, `modality`)
- `src/lib/services/information.md` — 가중치·시스템 프롬프트 구현 명세
- `src/app/api/` — 백엔드 API (Route Handlers)
- `src/middleware.ts` — 인증 보호
