"use client";

import { CheckCircle2, Clock, Zap, ArrowRight, Copy, Target } from "lucide-react";

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
              Prompt-U가 다음 요청을 위해<br/>더 똑똑해졌습니다.
            </h1>
            <p className="text-[#454652] text-[18px]">
              선택하신 프롬프트 스타일을 분석하여 개인 선호 모델을 재보정했습니다.
            </p>
          </div>
          
          {/* Selected Prompt Highlight */}
          <div className="bg-white border border-[rgba(197,197,212,0.15)] rounded-xl shadow-sm p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center w-full">
              <div className="bg-[#d9e2ff] px-3 py-1 rounded-full">
                <span className="text-[#001945] text-xs tracking-wide uppercase">현재 선택된 프롬프트</span>
              </div>
              <div className="flex items-center gap-2 text-[#454652] text-sm">
                <Clock className="w-3.5 h-3.5" />
                <span>방금 선택됨</span>
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
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2b3896] to-[#4551af] flex items-center justify-center shadow-inner">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[16px] text-[#191c1e] leading-snug">선호 모델 업데이트됨</h3>
                <p className="text-[#454652] text-xs mt-0.5">신경망 가중치 재조정됨</p>
              </div>
            </div>

            {/* Indicator 1 */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <span className="text-[14px] text-[#191c1e]">톤 변화</span>
                <span className="text-[12px] font-semibold text-[#003e93]">+14% 보고형</span>
              </div>
              <div className="h-2 bg-[#e0e3e5] rounded-full w-full overflow-hidden relative">
                <div className="h-full bg-[#003e93] w-[75%] rounded-full absolute left-0" />
              </div>
              <div className="flex justify-between w-full">
                <span className="text-[10px] text-[#757684] uppercase tracking-wider">대화형</span>
                <span className="text-[10px] text-[#757684] uppercase tracking-wider">보고형</span>
              </div>
            </div>

            {/* Indicator 2 */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <span className="text-[14px] text-[#191c1e]">복잡도</span>
                <span className="text-[12px] font-semibold text-[#003e93]">+22% 정교함</span>
              </div>
              <div className="h-2 bg-[#e0e3e5] rounded-full w-full overflow-hidden relative">
                <div className="h-full bg-[#003e93] w-[85%] rounded-full absolute left-0" />
              </div>
              <div className="flex justify-between w-full">
                <span className="text-[10px] text-[#757684] uppercase tracking-wider">간결함</span>
                <span className="text-[10px] text-[#757684] uppercase tracking-wider">정교함</span>
              </div>
            </div>

            {/* Indicator 3 */}
            <div className="flex flex-col gap-3 mb-2">
              <div className="flex justify-between items-end">
                <span className="text-[14px] text-[#191c1e]">전문성</span>
                <span className="text-[12px] font-semibold text-[#003e93]">+22% 심화형</span>
              </div>
              <div className="h-2 bg-[#e0e3e5] rounded-full w-full overflow-hidden relative">
                <div className="h-full bg-[#003e93] w-[85%] rounded-full absolute left-0" />
              </div>
              <div className="flex justify-between w-full">
                <span className="text-[10px] text-[#757684] uppercase tracking-wider">기본형</span>
                <span className="text-[10px] text-[#757684] uppercase tracking-wider">심화형</span>
              </div>
            </div>

            <div className="border-t border-[rgba(197,197,212,0.2)] pt-5 mt-2 flex gap-3">
              <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#454652] leading-relaxed">
                향후 상호 작용에서 창의적인 산문보다 논리 체인을 우선시합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
