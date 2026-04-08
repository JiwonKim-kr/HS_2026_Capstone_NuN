"use client";

import { useState } from "react";
import { Sparkles, Edit2, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface AnalysisResultProps {
  originalPrompt: string;
  onSelect: (text: string) => void;
}

export function AnalysisResult({ originalPrompt, onSelect }: AnalysisResultProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const versions = [
    {
      id: "01",
      title: "직설적이고 전문적으로",
      description: `"시니어 어카운트 매니저로서 행동하세요. 프로젝트 [X]의 14일 지연에 대해 [고객 이름]에게 간결한 이메일을 작성하세요. 원인이 리소스 재할당임을 명확히 밝히세요. 호의의 표시로 2단계 프로젝트에 대해 15% 할인을 제안하세요. 단호하면서도 공감하는 톤을 사용하세요."`,
    },
    {
      id: "02",
      title: "창의적이고 상세하게",
      description: `"2주 연기에 관한 중요 고객 커뮤니케이션 초안을 작성하세요. 상황: 예상치 못한 기술적 부채. 과업: 극도의 투명성을 통해 신뢰 유지. 행동 유도: 다음 마일스톤에 대한 계층별 할인을 수락하도록 유도. 스토리텔링을 사용하여 지연을 품질 보증을 위한 성과로 프레임화하세요."`,
    },
    {
      id: "03",
      title: "간결하고 명확하게",
      description: `"2주 지연에 대한 짧은 고객 이메일을 작성하세요. 일정 변경에 대해 정직하게 설명하세요. 향후 작업에 대한 할인 혜택을 포함하세요. 100단어 이내로 유지하고 해결책에 집중하세요."`,
    }
  ];

  return (
    <div className="flex flex-col items-start w-full max-w-6xl mx-auto h-full pt-12 pb-16 px-6 overflow-x-clip">
      
      {/* Analysis Header */}
      <div className="w-full flex justify-between items-end mb-12">
        <div className="max-w-[650px]">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d9e2ff] rounded-full mb-6 relative">
            <Sparkles className="w-[13px] h-[13px] text-[#001945]" />
            <span className="text-[#001945] text-xs font-medium">분석 활성화됨</span>
          </div>
          <h1 className="text-[48px] font-bold text-[#191c1e] tracking-[-1.2px] leading-[48px] mb-4">
            프롬프트 분석 및 후보군
          </h1>
          <p className="text-[#454652] text-[18px]">
            의도를 분석하여 AI 모델 상호작용을 위한 세 가지 최적화된 후보군을 생성했습니다.
          </p>
        </div>
      </div>

      {/* User Input Section */}
      <div className="w-full relative mb-12">
        <div className="w-full flex">
          <div className="flex-1 border-l-4 border-[#2b3896] bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <Edit2 className="w-4 h-4 text-gray-500" />
              <h2 className="text-[#757684] text-sm tracking-[1.4px] font-medium uppercase font-['Actor']">사용자 입력</h2>
            </div>
            <p className="text-[#191c1e] text-[20px] leading-[32.5px] italic font-medium">
              "{originalPrompt || "초안 텍스트가 전달되지 않았습니다."}"
            </p>
          </div>
        </div>
      </div>

      {/* Prompt Candidates Header */}
      <div className="w-full flex items-center mb-6">
        <h2 className="text-[24px] text-[#191c1e] mr-4 whitespace-nowrap">프롬프트 후보군</h2>
        <div className="flex-1 h-px bg-[#e0e3e5]" />
      </div>

      {/* Candidate Card 3D Carousel Wrapper (Prevents Horizontal Scroll Jitter, allows Vertical) */}
      <div className="w-full relative py-6">
        <div className="relative w-full max-w-[1000px] mx-auto h-[540px] flex items-center justify-center">
          
          {/* Left Arrow */}
          <button 
            onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : versions.length - 1)}
            className="absolute left-[10px] md:-left-4 z-30 flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-[#454652] hover:text-[#003e93] hover:scale-105 transition-all"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {versions.map((version, idx) => {
            let offset = idx - currentIndex;
            if (offset < -1) offset += versions.length;
            if (offset > 1) offset -= versions.length;

            const isCenter = offset === 0;
            let transformStr = "translateX(0) scale(1)";
            if (offset === -1) transformStr = "translateX(-65%) scale(0.85)";
            if (offset === 1) transformStr = "translateX(65%) scale(0.85)";

            return (
              <div 
                key={version.id}
                className={`absolute top-2 w-full max-w-[600px] h-[500px] group flex flex-col justify-between bg-white rounded-xl p-10 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${
                  isCenter 
                    ? "border-t-4 border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-[#003e93] hover:ring-1 hover:ring-black/5 hover:ring-offset-[3px] hover:shadow-[0_16px_40px_rgba(0,62,147,0.12)] z-20 cursor-pointer" 
                    : "border-t-4 border-transparent shadow-sm opacity-50 z-10 cursor-default"
                }`}
                style={{
                  transform: transformStr,
                  pointerEvents: isCenter ? 'auto' : 'none'
                }}
                onClick={() => isCenter && onSelect(version.description)}
              >
                <div className="flex-1 h-full flex flex-col pointer-events-none">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-sm font-semibold tracking-[1.4px] uppercase text-[#2b3896] group-hover:text-[#003e93] transition-colors">
                      버전 {version.id}
                    </span>
                  </div>
                  
                  <h3 className="text-[26px] font-medium text-[#191c1e] mb-6">
                    {version.title}
                  </h3>
                  
                  <div className="flex-1 mb-6 overflow-y-auto pr-3 custom-scrollbar">
                    <p className="text-[18px] text-[#454652] leading-[32px]">
                      {version.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-['Actor'] text-[18px] transition-all bg-[#e6e8ea] text-[#191c1e] ${isCenter ? 'group-hover:bg-[#003e93] group-hover:text-white group-hover:shadow-lg border border-transparent group-hover:border-[#003e93]' : ''}`}
                  >
                    이 버전 선택하기
                    <CheckCircle className={`w-5 h-5 transition-colors ${isCenter ? 'text-gray-500 group-hover:text-white' : 'text-gray-400'}`} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Right Arrow */}
          <button 
            onClick={() => setCurrentIndex(prev => prev < versions.length - 1 ? prev + 1 : 0)}
            className="absolute right-[10px] md:-right-4 z-30 flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-[#454652] hover:text-[#003e93] hover:scale-105 transition-all"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="w-full flex justify-center items-center gap-3 mt-4 h-4">
        {versions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-[#003e93] w-8' : 'bg-[#e0e3e5] w-3 hover:bg-[#c5c5d4]'}`}
          />
        ))}
      </div>
    </div>
  );
}
