"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

export function LandingFooter() {
  const { language } = useTranslation();
  return (
    <footer className="w-full bg-[#f8f9fb] border-t border-[#eceef0] py-[48px] px-[24px] flex justify-center">
      <div className="w-full max-w-[1280px] flex items-center justify-between">
        <div className="flex flex-col gap-[8px]">
          <span className="font-bold font-['Manrope'] text-[#191c1e] text-[20px] tracking-[-1px] leading-[28px]">
            Prompt-U
          </span>
          <p className="text-[#454652] text-[14px] leading-[20px]">
            {language === 'ko' ? '누구나 쉽게 다루는 개인화 AI 프롬프트 솔루션.' : 'A personalized AI prompt solution that anyone can easily use.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
