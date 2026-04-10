"use client";

import { Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-[40px] items-start w-full max-w-[896px] py-[48px] mx-auto z-10 relative">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[#191c1e] text-[36px] font-bold tracking-[-0.9px] leading-[40px]">
          당신의 프롬프트 성향
        </h1>
        <p className="text-[#454652] text-[18px] leading-[28px]">
          AI가 분석한 최근 사용자 프롬프트 패턴과 선호도 가중치입니다.
        </p>
      </div>

      {/* Content Area */}
      <div className="flex w-full">
        {/* Main Insights: Horizontal Bar Charts */}
        <div className="bg-white border border-[#c5c5d4]/10 w-[802px] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-[33px] flex flex-col gap-10">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-[#191c1e] text-[20px] font-medium leading-[28px]">
              사용자 가중치 시각화
            </h2>
            <div className="bg-[#d9e2ff] flex items-center gap-1.5 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#001945]" />
              <span className="text-[#001945] text-[12px] font-medium">
                AI 최적화 완료
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {/* Item 1 */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2b3896]" />
                  <span className="text-[#454652] text-[14px] font-semibold tracking-[-0.35px]">
                    답변 어투
                  </span>
                </div>
                <span className="text-[#2b3896] text-[18px] font-bold leading-none">
                  80%
                </span>
              </div>
              <div className="w-full h-3 bg-[#f2f4f6] rounded-full overflow-hidden">
                <div className="h-full bg-[#2b3896] rounded-full w-[80%] transition-all duration-1000 ease-in-out" />
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2b3896]" />
                  <span className="text-[#454652] text-[14px] font-semibold tracking-[-0.35px]">
                    답변 수준 (전문성 + 어휘 수준)
                  </span>
                </div>
                <span className="text-[#2b3896] text-[18px] font-bold leading-none">
                  90%
                </span>
              </div>
              <div className="w-full h-3 bg-[#f2f4f6] rounded-full overflow-hidden">
                <div className="h-full bg-[#2b3896] rounded-full w-[90%] transition-all duration-1000 ease-in-out" />
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2b3896]" />
                  <span className="text-[#454652] text-[14px] font-semibold tracking-[-0.35px]">
                    정보 밀도 및 구체성
                  </span>
                </div>
                <span className="text-[#2b3896] text-[18px] font-bold leading-none">
                  30%
                </span>
              </div>
              <div className="w-full h-3 bg-[#f2f4f6] rounded-full overflow-hidden">
                <div className="h-full bg-[#2b3896] rounded-full w-[30%] transition-all duration-1000 ease-in-out" />
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2b3896]" />
                  <span className="text-[#454652] text-[14px] font-semibold tracking-[-0.35px]">
                    창의성 및 허용도
                  </span>
                </div>
                <span className="text-[#2b3896] text-[18px] font-bold leading-none">
                  70%
                </span>
              </div>
              <div className="w-full h-3 bg-[#f2f4f6] rounded-full overflow-hidden">
                <div className="h-full bg-[#2b3896] rounded-full w-[70%] transition-all duration-1000 ease-in-out" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
