# Prompt-U Frontend Routing Plan

본 문서는 Prompt-U 클라이언트(`client/src/app`)의 라우팅 구조와 정책을 정의합니다. 새로운 페이지나 라우터를 추가·수정할 때 본 규칙을 준수해야 합니다.

## 1. Directory Structure & Paths

| Path (URL) | App Directory | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | 랜딩 페이지 — 로그인 폼 포함 | No |
| `/signup` | `app/signup/page.tsx` | 회원가입 페이지 (이메일, 비밀번호, 전화번호) | No |
| `/onboarding` | `app/onboarding/page.tsx` | 온보딩 1단계 — 직업·목적 입력 | No |
| `/onboarding/step2` | `app/onboarding/step2/page.tsx` | 온보딩 2단계 — 선호도 입력 | No |
| `/dashboard` | `app/dashboard/page.tsx` | 핵심 애플리케이션 화면 — 프롬프트 에디터·결과 확인 | Yes |
| `/dashboard/analytics` | `app/dashboard/analytics/page.tsx` | 사용자 가중치 시각화 페이지 | Yes |
| `/dashboard/history/[id]` | `app/dashboard/history/[id]/page.tsx` | 프롬프트 히스토리 상세 | Yes |
| `/dashboard/profile` | `app/dashboard/profile/page.tsx` | 대시보드 내 프로필 설정 | Yes |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | 환경 설정 (언어, 개인정보, 계정 삭제) | Yes |
| `/profile` | `app/profile/page.tsx` | 사용자 프로필 관리 (독립 라우트) | Yes |

**인증 보호 범위**: 미들웨어(`src/middleware.ts`)에서 `/dashboard/**` 와 `/profile/**` 경로를 보호합니다. 온보딩 경로(`/onboarding/**`)는 회원가입 직후 세션 없이도 접근 가능하도록 의도적으로 보호에서 제외됩니다.

## 2. Navigation Rules

1. **Guest User (미로그인)**:
   - 접속 시 항상 랜딩 페이지(`/`) 노출.
   - 랜딩 페이지 내 로그인 폼 또는 "회원가입" 버튼을 통해 인증 플로우 진입.
2. **First-time Auth User (신규가입자)**:
   - `/signup`에서 회원가입 완료 시 `/onboarding`으로 리다이렉트.
   - 온보딩 2단계를 완료해야만 다음 단계로 진행 가능.
3. **Returning User (기존 사용자)**:
   - 로그인 완료 시 바로 `/dashboard`로 리다이렉트.
4. **Onboarding Completion**:
   - `/onboarding/step2` 내 최종 "계속하기" 액션 발생 시, 정보를 Supabase에 저장한 뒤 `/dashboard`로 `router.push('/dashboard')`.
5. **Unauthenticated access to protected route**:
   - 미들웨어가 세션 부재를 감지하면 `/?next=<원래경로>`로 리다이렉트하여 로그인 후 복귀 처리.

## 3. Layout Conventions

- **Landing Layout**: 랜딩 전용 Navbar(Sticky)와 Footer를 가짐. 애플리케이션 메인 레이아웃과 공유하지 않음.
- **Signup / Onboarding Layout**: 상단 진행 바 및 단계 표시기가 포함된 단독 레이아웃. `OnboardingLayout` 컴포넌트 사용.
- **Main Layout (`/dashboard/**`, `/profile`)**: 고정 Sidebar와 TopNavBar가 포함된 `MainLayout` 사용. 하위 페이지들은 `app/dashboard/layout.tsx`를 통해 렌더링됨.
