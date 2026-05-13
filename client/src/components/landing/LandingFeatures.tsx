"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function LandingFeatures() {
  const { t } = useTranslation();
  return (
    <section className="w-full bg-[#f2f4f6] flex justify-center py-[96px] px-[24px]">
      <div className="flex flex-col md:flex-row gap-[40px] md:gap-[64px] items-start w-full max-w-[1280px]">

        {/* Left Info Section */}
        <div className="flex flex-col gap-[24px] w-full md:w-[389.33px] md:flex-shrink-0">
          <div className="w-full">
            <h2 className="text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px] m-0">
              {t("landing.features.title1")} <span className="text-[#003e93]">{t("landing.features.title2")}</span>
              <br />
              {t("landing.features.title3")} <span className="text-[#003e93]">{t("landing.features.title4")}</span>
            </h2>
          </div>
          <div className="w-full">
            <p className="text-[#454652] text-[16px] leading-[26px]">
              {t("landing.features.desc")}
            </p>
          </div>
          <div className="flex flex-col gap-[16px] w-full pt-[16px]">
            <div className="flex items-center gap-[12px]">
              <div className="bg-[#e0e3e5] rounded-[8px] size-[40px] flex items-center justify-center flex-shrink-0">
                <div className="relative w-[19px] h-[20px]">
                  <Image src="/icons/landing/learning.svg" alt="Learning" fill className="object-contain" />
                </div>
              </div>
              <span className="text-[#191c1e] text-[16px] leading-[24px]">{t("landing.features.point1")}</span>
            </div>
            <div className="flex items-center gap-[12px]">
              <div className="bg-[#e0e3e5] rounded-[8px] size-[40px] flex items-center justify-center flex-shrink-0">
                <div className="relative size-[24px]">
                  <Image src="/icons/landing/target_fill.svg" alt="Target" fill className="object-contain" />
                </div>
              </div>
              <span className="text-[#191c1e] text-[16px] leading-[24px]">{t("landing.features.point2")}</span>
            </div>
          </div>
        </div>

        {/* Right Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[24px] md:gap-[32px] w-full">
          
          {/* Bento 1: 프롬프트 재구성 */}
          <div className="bg-white rounded-[12px] p-[32px] flex flex-col gap-[24px]">
            <div className="bg-[#d9e2ff] rounded-[8px] size-[48px] flex items-center justify-center">
              <div className="relative size-[18px]">
                <Image src="/icons/landing/bento_1.svg" alt="Reconstruct" fill className="object-contain" />
              </div>
            </div>
            <div className="flex flex-col gap-[6.75px]">
              <h3 className="text-[#191c1e] text-[20px] leading-[28px]">{t("landing.features.bento1.title")}</h3>
              <p className="text-[#454652] text-[14px] leading-[22.75px]">
                {t("landing.features.bento1.desc")}
              </p>
            </div>
          </div>

          {/* Bento 2: 피드백 루프 */}
          <div className="bg-white rounded-[12px] p-[32px] flex flex-col gap-[24px]">
            <div className="bg-[#dfe0ff] rounded-[8px] size-[48px] flex items-center justify-center">
              <div className="relative size-[18px]">
                <Image src="/icons/landing/bento_2.svg" alt="Feedback Loop" fill className="object-contain" />
              </div>
            </div>
            <div className="flex flex-col gap-[6.75px]">
              <h3 className="text-[#191c1e] text-[20px] leading-[28px]">{t("landing.features.bento2.title")}</h3>
              <p className="text-[#454652] text-[14px] leading-[22.75px]">
                {t("landing.features.bento2.desc")}
              </p>
            </div>
          </div>

          {/* Bento 3: 시간 단축 */}
          <div className="bg-white rounded-[12px] p-[32px] flex flex-col gap-[24px]">
            <div className="bg-[#e0e3e5] rounded-[8px] size-[48px] flex items-center justify-center">
              <div className="relative size-[24px]">
                <Image src="/icons/landing/bento_clock.svg" alt="Clock" fill className="object-contain" />
              </div>
            </div>
            <div className="flex flex-col gap-[7.125px]">
              <h3 className="text-[#191c1e] text-[20px] leading-[28px]">{t("landing.features.bento3.title")}</h3>
              <p className="text-[#454652] text-[14px] leading-[22.75px]">
                {t("landing.features.bento3.desc")}
              </p>
            </div>
          </div>

          {/* Bento 4: 액션 카드 */}
          <div className="bg-[#2b3896] rounded-[12px] py-[32px] px-[32px] flex flex-col items-start overflow-hidden">
             <div className="flex flex-col gap-[6.8px] w-full">
              <h3 className="text-white text-[20px] leading-[28px]">{t("landing.features.bento4.title")}</h3>
              <div className="opacity-90 pb-[17.2px]">
                <p className="text-white text-[14px] leading-[22.75px] whitespace-pre-line">
                  {t("landing.features.bento4.desc")}
                </p>
              </div>
              <Link 
                href="/signup"
                className="bg-white hover:bg-gray-100 transition-colors rounded-[8px] px-[16px] py-[8px] flex items-center justify-center"
              >
                <span className="text-[#2b3896] text-[14px] leading-[20px]">{t("landing.features.bento4.btn")}</span>
              </Link>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
