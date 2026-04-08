import React from "react";
import Link from "next/link";

interface OnboardingLayoutProps {
  /** 현재 단계 (1-based). 프로그레스 바 계산에 사용. */
  currentStep: number;
  /** 전체 단계 수 */
  totalSteps: number;
  /** 좌측 사이드바 영역 */
  aside: React.ReactNode;
  /** 우측 메인 콘텐츠 영역 */
  children: React.ReactNode;
}

export function OnboardingLayout({
  currentStep,
  totalSteps,
  aside,
  children,
}: OnboardingLayoutProps) {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="relative min-h-screen bg-[#f8f9fb]">

      {/* ── Progress bar (4px, top 0) ───────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-[4px] bg-[#f2f4f6] z-50 overflow-hidden">
        <div
          className="h-full bg-[#003e93] transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ── Header ─────────────────────────────────────── */}
      <header className="fixed top-[4px] left-0 right-0 z-40 backdrop-blur-[12px] bg-[rgba(248,249,251,0.8)] flex items-center justify-between px-[24px] py-[16px]">
        {/* Logo — click to go home (refresh) */}
        <Link href="/onboarding" className="flex flex-col justify-center h-[28px] cursor-pointer hover:opacity-70 transition-opacity duration-150">
          <span className="font-bold text-[#191c1e] text-[20px] tracking-[-1px] leading-[28px] font-[Manrope,sans-serif]">
            Prompt-U
          </span>
        </Link>

        {/* Step indicator text */}
        <div className="flex flex-col justify-center h-[16px]">
          <span className="text-[#757684] text-[12px] tracking-[1.2px] uppercase leading-[16px]">
            {totalSteps}단계 중 {currentStep}단계
          </span>
        </div>
      </header>

      {/* ── Main body ──────────────────────────────────── */}
      {/* top padding = 4px (progress) + header height ~60px ≈ 72px */}
      <main className="pt-[72px] min-h-screen flex items-center justify-center px-[16px] pb-[48px]">
        <div className="w-full max-w-[1280px] grid grid-cols-12 gap-x-[32px] items-start px-[192px] max-[1280px]:px-[64px] max-[768px]:px-[16px] max-[768px]:grid-cols-1">

          {/* Left aside */}
          <aside className="col-span-4 max-[768px]:col-span-1 flex flex-col gap-[32px] pt-[40px]">
            {aside}
          </aside>

          {/* Right card */}
          <div className="col-span-8 max-[768px]:col-span-1 bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-[32px] pt-[32px] pb-[48px] min-h-[300px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
