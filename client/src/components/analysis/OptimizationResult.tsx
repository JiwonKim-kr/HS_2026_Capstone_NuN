"use client";

import { CheckCircle2, Zap, Copy, Brain, Info } from "lucide-react";

interface OptimizationResultProps {
  selectedText: string;
  onRestart: () => void;
}

export function OptimizationResult({ selectedText, onRestart }: OptimizationResultProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto h-full pt-12 pb-16 px-6">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full max-w-[1232px]">
        {/* Left Section - Main Content */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#003e93]" />
            <span className="text-[#003e93] text-[18px] tracking-[1.8px] uppercase">선택 완료</span>
          </div>
          
          <div className="mb-6">
            <h1 className="text-[48px] font-bold text-[#191c1e] tracking-[-2.4px] leading-[48px] mb-4">
              당신의 선택으로 Prompt-U가 더욱<br/>정교해졌습니다.
            </h1>
            <p className="text-[#454652] text-[18px]">
              선택한 프롬프트 스타일을 분석하여 앞으로 더 맞춤화된 프롬프트를 제안합니다.
            </p>
          </div>
          
          {/* Selected Prompt Highlight */}
          <div className="bg-white border border-[rgba(197,197,212,0.15)] rounded-xl shadow-sm p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center w-full">
              <div className="bg-[#d9e2ff] px-3 py-1 rounded-full">
                <span className="text-[#001945] text-xs tracking-wide uppercase">현재 선택된 프롬프트</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <h2 className="text-[24px] text-[#191c1e]">고객 응대: 지연 안내 및 신뢰 회복</h2>
              
              <div className="bg-[#f2f4f6] border-l-4 border-[#003e93] rounded-lg p-6">
                <p className="text-[#454652] text-[14px] leading-[28px]">
                  {selectedText || "2주 연기에 관한 중요 고객 커뮤니케이션 초안을 작성하세요. 상황: 예상치 못한 기술적 부채. 과업: 극도의 투명성을 통해 신뢰 유지. 행동 유도: 다음 마일스톤에 대한 계층별 할인을 수락하도록 유도. 스토리텔링을 사용하여 지연을 품질 보증을 위한 성과로 프레임화하세요."}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 mt-2">
              <button 
                onClick={onRestart}
                className="bg-[#003e93] text-white hover:bg-[#002f6e] flex gap-2 items-center px-8 py-3 rounded-lg shadow-sm transition-colors text-[16px]"
              >
                <Zap className="w-4 h-4 text-white" />
                새 프롬프트 시작
              </button>
              <button 
                onClick={() => navigator.clipboard.writeText(selectedText)}
                className="bg-[#e4e2e1] text-[#656464] hover:bg-[#d5d3d2] flex gap-2 items-center justify-center px-8 py-3 rounded-lg transition-colors text-[16px]"
              >
                <Copy className="w-4 h-4 text-gray-600" />
                클립보드에 복사
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Side Panel */}
        <div className="md:col-span-4 flex flex-col md:pl-2">
          <div className="bg-[#f2f4f6] border border-[rgba(197,197,212,0.15)] rounded-xl p-6 flex flex-col gap-6 sticky top-24 shadow-sm">
            
            <div className="flex gap-4 items-center mb-2">
              <div className="w-12 h-12 rounded-lg bg-[#2b3896] flex items-center justify-center shadow-inner mt-1">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[20px] font-bold text-[#191c1e]">가중치 조정</h3>
            </div>

            {[
              { label: "답변 어투", value: "+14%", width: "75%" },
              { label: "답변 수준 (전문성 + 어휘 수준)", value: "+22%", width: "85%" },
              { label: "정보 밀도 및 구체성", value: "+22%", width: "85%" },
              { label: "창의성 및 허용도", value: "+22%", width: "85%" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <span className="text-[14px] text-[#191c1e]">{item.label}</span>
                  <span className="text-[12px] font-semibold text-[#003e93]">{item.value}</span>
                </div>
                <div className="h-2 bg-[#e0e3e5] rounded-full w-full relative flex items-center">
                  <div className="h-full bg-[#003e93] rounded-full absolute left-0" style={{ width: item.width }} />
                  <div className="absolute bg-white border-2 border-[#003e93] rounded-full w-4 h-4 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] z-10" style={{ left: `calc(${item.width} - 8px)` }} />
                </div>
              </div>
            ))}

            <div className="border-t border-[rgba(197,197,212,0.2)] pt-5 mt-4 flex gap-3">
              <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#454652] leading-relaxed">
                이후 해당 가중치를 반영해 답변을 제안합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
