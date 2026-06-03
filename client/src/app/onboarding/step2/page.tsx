import { redirect } from "next/navigation";

// 온보딩 플로우는 /onboarding 단일 페이지에서 step1·2를 모두 처리합니다.
// 이 경로로 직접 접근하면 /onboarding으로 보냅니다.
export default function OnboardingStep2Page() {
  redirect("/onboarding");
}
