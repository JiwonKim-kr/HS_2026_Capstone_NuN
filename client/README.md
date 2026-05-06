# Prompt-U — Client

개인화 AI 프롬프트 제너레이터 **Prompt-U**의 Next.js 클라이언트입니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Auth / DB**: Supabase (SSR 클라이언트)
- **AI SDK**: `@ai-sdk/anthropic` — Express 서버 프록시를 통해 호출
- **Styling**: Tailwind CSS

## 개발 서버 실행

```bash
npm run dev
```

기본 포트는 `http://localhost:3000`입니다.

백엔드 Express 서버(`server/`)가 함께 실행되어야 프롬프트 생성 기능이 동작합니다.

## 환경 변수

`.env.local` 파일에 다음 변수를 설정합니다.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EXPRESS_API_URL=http://localhost:8080
```

## 라우팅 구조

라우팅 정책과 레이아웃 규칙은 [ROUTING_PLAN.md](./ROUTING_PLAN.md)를 참고하세요.
