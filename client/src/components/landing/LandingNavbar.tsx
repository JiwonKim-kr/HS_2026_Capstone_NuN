"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function LandingNavbar() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === "ko" ? "en" : "ko");
  };

  return (
    <div className="absolute top-0 left-0 w-full flex justify-center z-50">
      <div className="w-full max-w-[1280px] backdrop-blur-[12px] bg-[rgba(248,249,251,0.8)] flex items-center justify-between px-[16px] md:px-[24px] py-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-[32px]">
          <div className="flex flex-col justify-center h-[28px]">
            <Link href="/" className="font-bold text-[#191c1e] text-[20px] tracking-[-1px] leading-[28px]">
              Prompt-U
            </Link>
          </div>
        </div>

        {/* Right Side: Language Toggle */}
        <div className="flex items-center gap-[16px]">
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-center p-2 rounded-full hover:bg-black/5 transition-colors"
            title={language === "ko" ? "Switch to English" : "한국어로 변경"}
          >
            <Globe className="w-5 h-5 text-[#454652]" />
          </button>
        </div>

      </div>
    </div>
  );
}
