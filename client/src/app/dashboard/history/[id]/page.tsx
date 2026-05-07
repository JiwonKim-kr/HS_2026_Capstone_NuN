"use client";

import { use, useState, useEffect } from "react";
import { Edit2, ChevronLeft, ChevronRight, ThumbsUp, Check, Copy } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

type Candidate = {
  candidateId: string;
  logId: string;
  content: string;
  metadata: any;
  isLiked: boolean;
};

type HistoryData = {
  sessionId: string;
  title: string;
  date: string;
  originalPrompt: string;
  candidates: Candidate[];
};

export default function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useAuth();
  const { id } = use(params);
  
  const [data, setData] = useState<HistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedStatus, setLikedStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/prompts/history/detail/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          
          // 초기 is_liked 상태 설정
          const initialLikes: Record<string, boolean> = {};
          json.data.candidates.forEach((c: Candidate) => {
            initialLikes[c.candidateId] = c.isLiked;
          });
          setLikedStatus(initialLikes);
        }
      } catch (error) {
        console.error("Failed to fetch history details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetail();
  }, [id]);

  const handleCopy = async (candidateId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(candidateId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const toggleFeedback = async (candidate: Candidate) => {
    if (!user) return;
    
    const targetLikeStatus = !likedStatus[candidate.candidateId];
    
    // Optimistic UI update
    setLikedStatus(prev => ({
      ...prev,
      [candidate.candidateId]: targetLikeStatus
    }));

    try {
      const appliedTiers = candidate.metadata.appliedTiers || {
        tone: 3, level: 3, density: 3, creativity: 3
      };

      const res = await fetch('/api/prompts/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historyId: candidate.logId,
          userId: user.id,
          appliedTiers,
          targetLikeStatus
        })
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error);
      }
    } catch (error) {
      console.error('Feedback Error:', error);
      // Revert on error
      setLikedStatus(prev => ({
        ...prev,
        [candidate.candidateId]: !targetLikeStatus
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        <p className="text-[#757684] text-[18px]">기록을 불러오는 중...</p>
      </div>
    );
  }

  if (!data || !data.candidates || data.candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        <p className="text-[#757684] text-[18px]">대화 기록을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const { title, date, originalPrompt, candidates } = data;

  return (
    <div className="flex flex-col items-start w-full max-w-6xl mx-auto h-full pt-12 pb-16 px-6 overflow-x-clip">

      {/* ── 페이지 헤더 ── */}
      <div className="w-full mb-12">
        <div className="inline-flex items-center px-3 py-1 bg-[#d9e2ff] rounded-full mb-4">
          <span className="text-[#001945] text-xs font-medium">대화 기록 · {date}</span>
        </div>

        <h1 className="text-[40px] font-bold text-[#191c1e] tracking-[-1px] leading-[46px] mb-3">
          {title.length > 50 ? title.substring(0, 50) + '...' : title}
        </h1>
        <p className="text-[#454652] text-[16px]">
          입력한 프롬프트와 AI가 생성한 후보군을 확인할 수 있습니다.
        </p>
      </div>

      {/* ── 사용자 입력 ── */}
      <div className="w-full mb-12">
        <div className="flex-1 border-l-4 border-[#2b3896] bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-4">
            <Edit2 className="w-4 h-4 text-gray-500" />
            <span className="text-[#757684] text-sm tracking-[1.4px] font-medium uppercase">
              사용자 입력
            </span>
          </div>
          <p className="text-[#191c1e] text-[20px] leading-[32.5px] italic font-medium">
            &ldquo;{originalPrompt}&rdquo;
          </p>
        </div>
      </div>

      {/* ── 후보군 헤더 ── */}
      <div className="w-full flex items-center mb-6">
        <h2 className="text-[24px] text-[#191c1e] mr-4 whitespace-nowrap">
          프롬프트 후보군
        </h2>
        <div className="flex-1 h-px bg-[#e0e3e5]" />
      </div>

      {/* ── 3D 캐러셀 ── */}
      <div className="w-full relative py-6">
        <div className="relative w-full max-w-[1000px] mx-auto h-[480px] flex items-center justify-center">

          {/* 왼쪽 화살표 */}
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev > 0 ? prev - 1 : candidates.length - 1))
            }
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
            
            const isLiked = likedStatus[candidate.candidateId];
            const isCopied = copiedId === candidate.candidateId;

            return (
              <div
                key={candidate.candidateId}
                className={`absolute top-2 w-full max-w-[600px] h-[450px] flex flex-col bg-white rounded-xl p-10 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${
                  isCenter
                    ? "border-t-4 border-[#003e93] shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-20"
                    : "border-t-4 border-transparent shadow-sm opacity-50 z-10"
                }`}
                style={{
                  transform: transformStr,
                  pointerEvents: isCenter ? "auto" : "none",
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-semibold tracking-[1.4px] uppercase text-[#2b3896]">
                    버전 {candidate.candidateId}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 mb-6">
                  <p className="text-[16px] text-[#454652] leading-[28px] whitespace-pre-wrap">
                    {candidate.content}
                  </p>
                </div>

                {/* Inline Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-auto">
                  <button 
                    onClick={() => handleCopy(candidate.candidateId, candidate.content)}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-300 ${
                      isCopied 
                        ? 'bg-green-50 text-green-600 border border-green-200' 
                        : 'bg-[#f8f9fb] text-[#454652] hover:bg-[#e9ecef] border border-transparent'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-5 h-5 text-green-500" />
                        복사완료!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        이 프롬프트 복사하기
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => toggleFeedback(candidate)}
                    className={`py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-300 border ${
                      isLiked
                        ? 'bg-green-50 text-green-700 border-green-300 shadow-sm'
                        : 'bg-white text-[#757684] border-gray-200 hover:bg-gray-50'
                    }`}
                    title={isLiked ? "추천 취소" : "이 프롬프트 추천하기"}
                  >
                    <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-green-600 text-green-600' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* 오른쪽 화살표 */}
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev < candidates.length - 1 ? prev + 1 : 0))
            }
            className="absolute right-[10px] md:-right-4 z-30 flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-[#454652] hover:text-[#003e93] hover:scale-105 transition-all"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* ── 슬라이드 인디케이터 ── */}
      <div className="w-full flex justify-center items-center gap-3 mt-4">
        {candidates.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-3 rounded-full transition-all ${
              idx === currentIndex
                ? "bg-[#003e93] w-8"
                : "bg-[#e0e3e5] w-3 hover:bg-[#c5c5d4]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
