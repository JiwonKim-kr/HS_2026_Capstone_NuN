# Prompt-U Frontend Routing Plan

본 문서는 Prompt-U 클라이언트(`client/src/app`)의 라우팅 구조와 정책을 정의합니다. 모든 에이전트 및 코-파일럿은 새로운 페이지나 라우터를 추가/수정할 때 본 규칙을 준수해야 합니다.

## 1. Directory Structure & Paths

| Path (URL) | App Directory | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | 랜딩 페이지 (최초 진입 화면) | No |
| `/onboarding` | `app/onboarding/page.tsx` | 신규 사용자 온보딩 플로우 (선호도 등 정보 획득) | Yes (또는 임시 토큰) |
| `/dashboard` | `app/dashboard/page.tsx` | 핵심 애플리케이션 화면 (프롬프트 에디터, 결과물 확인 등) | Yes |

*(향후 필요에 따라 `/login`, `/settings` 등이 추가될 수 있습니다.)*

## 2. Navigation Rules

1. **Guest User (미로그인)**: 
   - 접속 시 항상 랜딩 페이지(`/`) 노출.
   - 랜딩 페이지의 "로그인" 및 "시작하기"를 통해 인증 플로우 진입.
2. **First-time Auth User (신규가입자)**:
   - 인증 완료 시 `/onboarding`으로 리다이렉팅.
   - 온보딩 2단계를 모두 수료해야만 다음으로 넘어감.
3. **Returning User (기존 사용자)**:
   - 인증 완료 시 바로 `/dashboard`로 리다이렉팅.
4. **Onboarding Completion**:
   - `/onboarding` 내에서 최종 단계 "계속하기" 액션 발생 시, 정보를 서버에 전송한 뒤 `/dashboard`로 자동 리다이렉트 처리(`router.push('/dashboard')`).

## 3. Layout Conventions
- **Landing Layout**: 랜딩 전용 Navbar(Sticky)와 Footer를 가짐. (어플리케이션 메인 레이아웃 공유 안함)
- **Onboarding Layout**: 상단 진행바 및 좌측 단계 표시기가 포함된 `OnboardingLayout` 단독 사용.
- **Main Layout (`/dashboard` 등)**: 고정된 Sidebar와 TopNavBar가 포함되는 `MainLayout` 사용. 하위 애플리케이션 페이지들은 이 레이아웃을 통해 렌더링됨.
