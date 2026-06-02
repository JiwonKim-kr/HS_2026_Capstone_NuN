"use client";

import { useState, useEffect } from "react";
import { Sparkles, Edit2, Copy, Check, ThumbsUp, ChevronLeft, ChevronRight, RotateCcw, Moon, AlertTriangle, AlertCircle, type LucideIcon } from "lucide-react";
import { PromptCandidateType } from "@/schemas/promptSchema";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { TranslationKey } from "@/lib/i18n/translations";

type ErrorConfig = {
  titleKey: TranslationKey;
  descKey: TranslationKey;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  borderColor: string;
};

const ERROR_CONFIG: Record<string, ErrorConfig> = {
  DAILY_LIMIT_EXCEEDED: {
    titleKey: 'analysis.error.limit_title',
    descKey: 'analysis.error.limit_desc',
    icon: Moon,
    iconColor: 'text-[#5b4fcf]',
    bgColor: 'bg-[#f3f0ff]',
    borderColor: 'border-[#c4b5fd]',
  },
  AI_SERVICE_ERROR: {
    titleKey: 'analysis.error.server_title',
    descKey: 'analysis.error.server_desc',
    icon: AlertTriangle,
    iconColor: 'text-[#b45309]',
    bgColor: 'bg-[#fffbeb]',
    borderColor: 'border-[#fcd34d]',
  },
  INVALID_INPUT: {
    titleKey: 'analysis.error.input_title',
    descKey: 'analysis.error.input_desc',
    icon: AlertCircle,
    iconColor: 'text-[#ba1a1a]',
    bgColor: 'bg-[#fff5f5]',
    borderColor: 'border-[#fca5a5]',
  },
};

const DEFAULT_ERROR_CONFIG: ErrorConfig = {
  titleKey: 'analysis.error.generic_title',
  descKey: 'analysis.error.generic_desc',
  icon: AlertCircle,
  iconColor: 'text-[#ba1a1a]',
  bgColor: 'bg-[#fff5f5]',
  borderColor: 'border-[#fca5a5]',
};

const LOADING_MESSAGE_KEYS: TranslationKey[] = [
  "analysis.loading.1",
  "analysis.loading.2",
  "analysis.loading.3",
  "analysis.loading.4",
  "analysis.loading.5",
  "analysis.loading.6",
];

interface AnalysisResultProps {
  originalPrompt: string;
  candidates: PromptCandidateType[];
  loading: boolean;
  error: { code: string; message: string } | null;
  onRestart: () => void;
}

export function AnalysisResult({ originalPrompt, candidates, loading, error, onRestart }: AnalysisResultProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedStatus, setLikedStatus] = useState<Record<string, boolean>>({});
  const [msgIndex, setMsgIndex] = useState(() => Math.floor(Math.random() * LOADING_MESSAGE_KEYS.length));
  const [msgVisible, setMsgVisible] = useState(true);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIndex(prev => {
          let next = Math.floor(Math.random() * LOADING_MESSAGE_KEYS.length);
          if (next === prev) next = (prev + 1) % LOADING_MESSAGE_KEYS.length;
          return next;
        });
        setMsgVisible(true);
      }, 400);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleCopy = async (candidate: PromptCandidateType) => {
    try {
      await navigator.clipboard.writeText(candidate.content);
      setCopiedId(candidate.candidateId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleToggleLike = async (candidate: PromptCandidateType) => {
    if (!candidate.logId) {
      alert(t("analysis.sync_wait"));
      return;
    }

    const currentStatus = likedStatus[candidate.candidateId] || false;
    const targetStatus = !currentStatus;

    setLikedStatus(prev => ({ ...prev, [candidate.candidateId]: targetStatus }));

    try {
      const res = await fetch('/api/prompts/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historyId: candidate.logId,
          appliedTiers: candidate.metadata.appliedTiers,
          targetModality: candidate.metadata.targetModality,
          targetLikeStatus: targetStatus
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || t("analysis.feedback_fail"));
      }
    } catch (err) {
      console.error("Feedback error:", err);
      setLikedStatus(prev => ({ ...prev, [candidate.candidateId]: currentStatus }));
      alert(t("analysis.feedback_fail"));
    }
  };

  return (
    <div className="flex flex-col items-start w-full max-w-6xl mx-auto h-full pt-12 pb-16 px-6 overflow-x-clip">

      {/* Analysis Header */}
      <div className="w-full flex justify-between items-end mb-12">
        <div className="max-w-[650px]">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d9e2ff] rounded-full mb-6 relative">
            <Sparkles className="w-[13px] h-[13px] text-[#001945]" />
            <span className="text-[#001945] text-xs font-medium">{t("analysis.badge")}</span>
          </div>
          <h1 className="text-[48px] font-bold text-[#191c1e] tracking-[-1.2px] leading-[48px] mb-4">
            {t("analysis.title")}
          </h1>
          <p className="text-[#454652] text-[18px]">
            {t("analysis.subtitle")}
          </p>
        </div>
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 text-[#454652] hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="font-medium">{t("analysis.restart")}</span>
        </button>
      </div>

      {/* User Input Section */}
      <div className="w-full relative mb-12">
        <div className="w-full flex">
          <div className="flex-1 border-l-4 border-[#2b3896] bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <Edit2 className="w-4 h-4 text-gray-500" />
              <h2 className="text-[#757684] text-sm tracking-[1.4px] font-medium uppercase font-['Actor']">{t("analysis.user_input")}</h2>
            </div>
            <p className="text-[#191c1e] text-[20px] leading-[32.5px] italic font-medium">
              &ldquo;{originalPrompt || t("analysis.no_draft")}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Prompt Candidates Header */}
      <div className="w-full flex items-center mb-6">
        <h2 className="text-[24px] text-[#191c1e] mr-4 whitespace-nowrap">{t("analysis.candidates")}</h2>
        <div className="flex-1 h-px bg-[#e0e3e5]" />
      </div>

      {/* Candidate Area */}
      {loading ? (
        <div className="w-full flex flex-col items-center justify-center gap-4 h-[540px]">
          <div className="w-10 h-10 border-4 border-[#003e93] border-t-transparent rounded-full animate-spin" />
          <p
            style={{ opacity: msgVisible ? 1 : 0, transition: 'opacity 400ms ease-in-out' }}
            className="text-[14px] text-gray-400"
          >
            {t(LOADING_MESSAGE_KEYS[msgIndex])}
          </p>
        </div>
      ) : error ? (
        (() => {
          const config = ERROR_CONFIG[error.code] ?? DEFAULT_ERROR_CONFIG;
          const Icon = config.icon;
          return (
            <div className="w-full flex items-center justify-center h-[540px]">
              <div className={`flex flex-col items-center gap-4 p-10 rounded-2xl border ${config.bgColor} ${config.borderColor} max-w-sm w-full text-center`}>
                <Icon className={`w-12 h-12 ${config.iconColor}`} />
                <div>
                  <p className="text-[18px] font-semibold text-[#191c1e] mb-1">{t(config.titleKey)}</p>
                  <p className="text-[14px] text-[#757684]">{t(config.descKey)}</p>
                </div>
                <button
                  onClick={onRestart}
                  className="mt-2 px-6 py-2.5 rounded-full bg-white border border-gray-200 text-[#454652] text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {t('analysis.error.retry')}
                </button>
              </div>
            </div>
          );
        })()
      ) : (
        <>
          {/* Candidate Card 3D Carousel Wrapper */}
          <div className="w-full relative py-6">
            <div className="relative w-full max-w-[1000px] mx-auto h-[480px] flex items-center justify-center">

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

                const isLiked = likedStatus[candidate.candidateId] || false;
                const isCopied = copiedId === candidate.candidateId;

                return (
                  <div
                    key={candidate.candidateId}
                    className={`absolute top-2 w-full max-w-[600px] h-[450px] flex flex-col bg-white rounded-xl p-10 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${isCenter
                        ? "border-t-4 border-[#003e93] shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-20 cursor-default"
                        : "border-t-4 border-transparent shadow-sm opacity-50 z-10 cursor-pointer"
                      }`}
                    style={{
                      transform: transformStr,
                      pointerEvents: isCenter ? 'auto' : 'auto'
                    }}
                    onClick={() => !isCenter && setCurrentIndex(idx)}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <span className="text-sm font-semibold tracking-[1.4px] uppercase text-[#2b3896] transition-colors">
                          {t("analysis.version")} {String(idx + 1).padStart(2, '0')}
                        </span>
                        {candidate.metadata.tierDescription && (
                          <p className="text-xs text-[#757684] mt-1">
                            {candidate.metadata.tierDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                      <p className="text-[16px] text-[#454652] leading-[28px] whitespace-pre-wrap">
                        {candidate.content}
                      </p>
                    </div>

                    {/* Inline Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100 mt-auto">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(candidate); }}
                        className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-300 ${isCopied
                            ? 'bg-green-50 text-green-600 border border-green-200'
                            : 'bg-[#f8f9fb] text-[#454652] hover:bg-[#e9ecef] border border-transparent'
                          }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-5 h-5 text-green-500" />
                            {t("analysis.copied")}
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            {t("analysis.copy")}
                          </>
                        )}
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleLike(candidate); }}
                        className={`py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-300 border ${isLiked
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
