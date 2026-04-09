"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Sparkles } from "lucide-react";

export default function ProfilePage() {
  const userWeights = [
    { label: "답변 어투", value: 80 },
    { label: "답변 수준 (전문성 + 어휘 수준)", value: 90 },
    { label: "정보 밀도 및 구체성", value: 30 },
    { label: "창의성 및 허용도", value: 70 },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col w-full max-w-4xl mx-auto h-full pt-12 pb-16 px-6">
        <div className="mb-10">
          <h1 className="text-[36px] font-bold text-[#191c1e] tracking-tight mb-3">
            당신의 프롬프트 성향
          </h1>
          <p className="text-[#454652] text-[18px]">
            AI가 분석한 최근 사용자 프롬프트 패턴과 선호도 가중치입니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[rgba(197,197,212,0.15)] p-10 flex flex-col gap-10">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-[22px] font-bold text-[#191c1e]">사용자 가중치 시각화</h2>
            <div className="bg-[#e4ebf7] px-4 py-2 rounded-full flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2b3896]" />
              <span className="text-[#2b3896] text-[14px] font-bold">AI 최적화 완료</span>
            </div>
          </div>

          <div className="flex flex-col gap-8 w-full max-w-3xl">
            {userWeights.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <div className="flex justify-between items-end w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#2b3896]" />
                    <span className="text-[16px] font-semibold text-[#454652]">{item.label}</span>
                  </div>
                  <span className="text-[20px] font-bold text-[#2b3896]">{item.value}%</span>
                </div>
                <div className="h-3 bg-[#f2f4f6] rounded-full w-full overflow-hidden">
                  <div 
                    className="h-full bg-[#2b3896] rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${item.value}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
