"use client";

import Image from "next/image";
import { Globe, ShieldCheck, AlertTriangle, ChevronDown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Language } from "@/lib/i18n/translations";
import { McpApiKeysSection } from "./McpApiKeysSection";
import { privacyPolicy, PolicyParagraph } from "@/lib/legal/privacyPolicy";

export default function SettingsPage() {
  const { language, setLanguage, t } = useTranslation();

  const handleDeleteAccount = () => {
    alert("계정 영구 삭제 로직 (TODO: 연동 필요)");
  };

  return (
    <div className="flex flex-col gap-[48px] items-start w-full max-w-[896px] py-[40px] mx-auto z-10 relative">
      {/* Header Section */}
      <div className="flex flex-col gap-[8px] w-full">
        <h2 className="text-[#191c1e] text-[30px] tracking-[-0.75px] leading-[36px]">
          {t("settings.title")}
        </h2>
        <p className="text-[#454652] text-[16px] leading-[24px]">
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-[32px] w-full">

        {/* Section 1: Language Change */}
        <section className="bg-white p-[32px] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[24px] w-full">
          <div className="flex items-start gap-[12px] w-full max-w-[285.8px]">
            <Globe className="w-[20px] h-[20px] text-[#454652] shrink-0 mt-[4px]" />
            <div className="flex flex-col gap-[4px] w-full">
              <h3 className="text-[#191c1e] text-[18px] leading-[28px]">{t("settings.language")}</h3>
              <p className="text-[#454652] text-[14px] leading-[20px]">
                {t("settings.language.desc")}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-[240px]">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-[#f2f4f6] text-[#191c1e] font-medium text-[16px] h-[48px] w-full rounded-[8px] pl-[16px] pr-[40px] appearance-none outline-none focus:ring-2 focus:ring-[#003e93]/50 transition-shadow cursor-pointer"
            >
              <option value="ko">한국어 (Korean)</option>
              <option value="en">English (US)</option>
            </select>
            <ChevronDown className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#454652] pointer-events-none" />
          </div>
        </section>

        {/* Section 2: Privacy Policy */}
        <section className="bg-white p-[32px] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col gap-[24px] w-full">
          <div className="flex items-center gap-[12px] w-full">
            <div className="bg-[#dfe0ff] w-[40px] h-[40px] rounded-[8px] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-[20px] h-[20px] text-[#003e93]" />
            </div>
            <h3 className="text-[#191c1e] text-[18px] leading-[28px]">
              {privacyPolicy[language].title}
            </h3>
          </div>

          {/* 스크롤 가능한 처리방침 박스 */}
          <div className="bg-[#f2f4f6] h-[320px] rounded-[8px] p-[24px] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-[#d1d5db] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="flex flex-col gap-[20px] text-[#454652] text-[14px] leading-[22px]">

              {/* 시행일 */}
              <p className="text-[12px] text-[#757684]">
                {privacyPolicy[language].effectiveDate}
              </p>

              {/* 서두 */}
              <p>{privacyPolicy[language].intro}</p>

              {/* 조항별 렌더링 */}
              {privacyPolicy[language].sections.map((section, i) => (
                <div key={i} className="flex flex-col gap-[8px]">
                  <h4 className="text-[#191c1e] text-[13px] font-semibold leading-[20px]">
                    {section.title}
                  </h4>
                  {section.content.map((block: PolicyParagraph, j) =>
                    block.type === 'text' ? (
                      <p key={j}>{block.text}</p>
                    ) : (
                      <ul key={j} className="flex flex-col gap-[4px] pl-[4px]">
                        {block.items.map((item, k) => (
                          <li key={k} className="flex gap-[8px]">
                            <span className="text-[#003e93] shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2.5: MCP API Keys */}
        <McpApiKeysSection />

        {/* Section 3: Account Deletion */}
        <section className="bg-[rgba(255,218,214,0.1)] border border-[rgba(255,218,214,0.2)] p-[32px] rounded-[12px] flex items-start gap-[16px] w-full transition-colors hover:bg-[rgba(255,218,214,0.15)]">
          <div className="bg-[#ba1a1a]/10 w-[38px] h-[35px] rounded-[8px] flex items-center justify-center shrink-0 mt-[4px]">
            <AlertTriangle className="w-[18px] h-[18px] text-[#ba1a1a]" />
          </div>

          <div className="flex flex-col gap-[16px] w-full">
            <div className="flex flex-col gap-[8px]">
              <h3 className="text-[#93000a] text-[18px] leading-[28px]">
                {language === 'ko' ? '계정 삭제' : 'Delete Account'}
              </h3>
              <div className="text-[#454652] text-[14px] leading-[20px]">
                {language === 'ko' ? (
                  <>
                    <p>계정을 삭제하면 모든 분석 데이터, 설정 및 큐레이션 기록이 영구적으로 제거됩니다.</p>
                    <p>이 작업은 되돌릴 수 없으므로 주의하시기 바랍니다.</p>
                  </>
                ) : (
                  <>
                    <p>Deleting your account permanently removes all analytics data, settings, and curation history.</p>
                    <p>Please note that this action cannot be undone.</p>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleDeleteAccount}
              className="bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[14px] h-[40px] px-[24px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-fit transition-colors flex items-center justify-center"
            >
              {language === 'ko' ? '계정 영구 삭제' : 'Delete Account Permanently'}
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
