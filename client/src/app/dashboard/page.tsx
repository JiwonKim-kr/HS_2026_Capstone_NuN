"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DraftEditor } from "@/components/prompt/DraftEditor";
import { ContextFilters } from "@/components/prompt/ContextFilters";
import { SuggestionBar } from "@/components/prompt/SuggestionBar";
import { AnalysisResult } from "@/components/analysis/AnalysisResult";
import { OptimizationResult } from "@/components/analysis/OptimizationResult";

export default function Home() {
  const [view, setView] = useState<'draft' | 'analysis' | 'optimized'>('draft');
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");

  const [activeContexts, setActiveContexts] = useState<string[]>([
    "대화형 어투",
    "보고서형 어투",
    "창의적인 답변"
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleRemoveContext = (tag: string) => {
    setActiveContexts(prev => prev.filter(c => c !== tag));
    setSuggestions(prev => [...prev, tag]);
  };

  const handleAddContext = (tag: string) => {
    setSuggestions(prev => prev.filter(s => s !== tag));
    setActiveContexts(prev => [...prev, tag]);
  };

  const handlePromptSubmit = (text: string) => {
    setSubmittedPrompt(text);
    setView('analysis');
  };

  const handleVersionSelect = (text: string) => {
    setSelectedVersion(text);
    setView('optimized');
  };

  const handleRestart = () => {
    setSubmittedPrompt("");
    setSelectedVersion("");
    setView('draft');
  };

  return (
    <>
      {view === 'draft' ? (
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto h-full pt-12 pb-16">
          {/* Header Text */}
          <div className="w-full max-w-[830px] mb-12">
            <h2 className="text-[36px] font-bold text-[#191c1e] tracking-[-0.9px] leading-[40px] mb-3">
              당신의 아이디어를 구체화하세요.
            </h2>
            <p className="text-[#454652] text-[18px] leading-[28px]">
              생각나는 대로 입력해 보세요. AI가 당신의 프로필을 기반으로 다듬어 드립니다.
            </p>
          </div>

          {/* Main Canvas Area */}
          <div className="w-full relative flex flex-col items-center">
            <DraftEditor onSubmit={handlePromptSubmit} />
            <ContextFilters contexts={activeContexts} onRemove={handleRemoveContext} />
          </div>

          {/* Floating Suggestions */}
          <div className="w-full flex justify-center mt-12 mb-8 h-[40px]">
            <SuggestionBar suggestions={suggestions} onAdd={handleAddContext} />
          </div>
        </div>
      ) : view === 'analysis' ? (
        <AnalysisResult 
          originalPrompt={submittedPrompt} 
          onSelect={handleVersionSelect} 
        />
      ) : (
        <OptimizationResult 
          selectedText={selectedVersion} 
          onRestart={handleRestart} 
        />
      )}
    </>
  );
}
