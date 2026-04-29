"use client";

import { useState } from "react";
import { Sparkles, Edit2, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { PromptCandidateType } from "@/schemas/promptSchema";

interface AnalysisResultProps {
  originalPrompt: string;
  candidates: PromptCandidateType[];
  loading: boolean;
  error: string | null;
  onSelect: (candidate: PromptCandidateType) => void;
}

export function AnalysisResult({ originalPrompt, candidates, loading, error, onSelect }: AnalysisResultProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

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

      {/* Candidate Area */}
      {loading ? (
        <div className="w-full flex items-center justify-center h-[540px]">
          <div className="w-10 h-10 border-4 border-[#003e93] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="w-full flex items-center justify-center h-[540px]">
          <p className="text-[#ba1a1a] text-[16px]">{error}</p>
        </div>
      ) : (
        <>
          {/* Candidate Card 3D Carousel Wrapper (Prevents Horizontal Scroll Jitter, allows Vertical) */}
          <div className="w-full relative py-6">
            <div className="relative w-full max-w-[1000px] mx-auto h-[540px] flex items-center justify-center">

              {/* Left Arrow */}
              <button
                onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : candidates.length - 1)}
                className="absolute left-[10px] md:-left-4 z-30 flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-[#454652] hover:text-[#003e93] hover:scale-105 transition-all"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              {candidates.map((candidate, idx) => {
                let offset = idx - currentIndex;
                if (offset < -1) offset += candidates.length;
                if (offset > 1) offset -= candidates.length;

                const isCenter = offset === 0;
                let transformStr = "translateX(0) scale(1)";
                if (offset === -1) transformStr = "translateX(-65%) scale(0.85)";
                if (offset === 1) transformStr = "translateX(65%) scale(0.85)";

                return (
                  <div
                    key={candidate.candidateId}
                    className={`absolute top-2 w-full max-w-[600px] h-[500px] group flex flex-col justify-between bg-white rounded-xl p-10 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${
                      isCenter
                        ? "border-t-4 border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-[#003e93] hover:ring-1 hover:ring-black/5 hover:ring-offset-[3px] hover:shadow-[0_16px_40px_rgba(0,62,147,0.12)] z-20 cursor-pointer"
                        : "border-t-4 border-transparent shadow-sm opacity-50 z-10 cursor-default"
                    }`}
                    style={{
                      transform: transformStr,
                      pointerEvents: isCenter ? 'auto' : 'none'
                    }}
                    onClick={() => isCenter && onSelect(candidate)}
                  >
                    <div className="flex-1 h-full flex flex-col pointer-events-none">
                      <div className="flex justify-between items-center mb-8">
                        <span className="text-sm font-semibold tracking-[1.4px] uppercase text-[#2b3896] group-hover:text-[#003e93] transition-colors">
                          버전 {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <h3 className="text-[26px] font-medium text-[#191c1e] mb-6">
                        {candidate.metadata.tone}
                      </h3>

                      <div className="flex-1 mb-6 overflow-y-auto pr-3 custom-scrollbar">
                        <p className="text-[18px] text-[#454652] leading-[32px]">
                          {candidate.content}
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
                onClick={() => setCurrentIndex(prev => prev < candidates.length - 1 ? prev + 1 : 0)}
                className="absolute right-[10px] md:-right-4 z-30 flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-[#454652] hover:text-[#003e93] hover:scale-105 transition-all"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="w-full flex justify-center items-center gap-3 mt-4 h-4">
            {candidates.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-[#003e93] w-8' : 'bg-[#e0e3e5] w-3 hover:bg-[#c5c5d4]'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
