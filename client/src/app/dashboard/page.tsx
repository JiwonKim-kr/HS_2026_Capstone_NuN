"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DraftEditor } from "@/components/prompt/DraftEditor";
import { AnalysisResult } from "@/components/analysis/AnalysisResult";
import { PromptCandidateType } from "@/schemas/promptSchema";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Home() {
  const [view, setView] = useState<'draft' | 'analysis'>('draft');
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [candidates, setCandidates] = useState<PromptCandidateType[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handlePromptSubmit = async (text: string) => {
    setSubmittedPrompt(text);
    setCandidates([]);
    setAnalysisError(null);
    setAnalysisLoading(true);
    setView('analysis');

    try {
      const res = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalInput: text }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || '생성 실패');
      setCandidates(json.data.candidates);
      window.dispatchEvent(new Event('prompt-generated'));
    } catch (err: any) {
      setAnalysisError(err.message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleRestart = () => {
    setSubmittedPrompt("");
    setCandidates([]);
    setAnalysisError(null);
    setView('draft');
  };

  return (
    <>
      {view === 'draft' ? (
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto h-full pt-12 pb-16">
          {/* Header Text */}
          <div className="w-full max-w-[830px] mb-12">
            <h2 className="text-[24px] md:text-[36px] font-bold text-[#191c1e] tracking-[-0.9px] leading-[40px] mb-3">
              {t("dashboard.title")}
            </h2>
            <p className="text-[#454652] text-[18px] leading-[28px]">
              {t("dashboard.subtitle")}
            </p>
          </div>

          {/* Main Canvas Area */}
          <div className="w-full relative flex flex-col items-center">
            <DraftEditor onSubmit={handlePromptSubmit} />
          </div>
        </div>
      ) : (
        <AnalysisResult
          originalPrompt={submittedPrompt}
          candidates={candidates}
          loading={analysisLoading}
          error={analysisError}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
