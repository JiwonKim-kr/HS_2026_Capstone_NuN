"use client";

import React, { useState } from "react";
import { ArrowRight, BriefcaseBusiness, GraduationCap, Palette, Terminal, MessageCircle, MoreHorizontal, Target, Scale, FolderSearch } from "lucide-react";
import { IconCardGroup } from "@/components/ui/icon-card-group";
import { Button } from "@/components/ui/button";

interface PurposeFormProps {
  onSubmit?: (data: PurposeFormData) => void;
}

export interface PurposeFormData {
  purposes: string[];
  detailLevel: string;
}

const PURPOSE_OPTIONS = [
  { value: "work", label: "업무/기획", icon: <BriefcaseBusiness size={20} /> },
  { value: "study", label: "학업/연구", icon: <GraduationCap size={20} /> },
  { value: "design", label: "디자인/예술", icon: <Palette size={20} /> },
  { value: "dev", label: "IT/개발", icon: <Terminal size={20} /> },
  { value: "counsel", label: "상담/심리", icon: <MessageCircle size={20} /> },
  { value: "general", label: "일반/기타", icon: <MoreHorizontal size={20} /> },
];

const DETAIL_OPTIONS = [
  { value: "concise", label: "핵심만 간결하게", icon: <Target size={20} /> },
  { value: "balanced", label: "균형있는 설명", icon: <Scale size={20} /> },
  { value: "detailed", label: "아주 디테일하게", icon: <FolderSearch size={20} /> },
];

export function PurposeForm({ onSubmit }: PurposeFormProps) {
  const [purposes, setPurposes] = useState<string[]>([]);
  const [detailLevel, setDetailLevel] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ purposes, detailLevel });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[40px] w-full">

      {/* ─── Section 1: 주요 활용 목적 ───────────────── */}
      <section className="flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[8px]">
          <span className="text-[#757684] text-[12px] tracking-[0.6px] uppercase leading-[16px]">
            워크플로우 통합
          </span>
          <h2 className="text-[#191c1e] text-[20px] leading-[28px] font-normal">
            주요 활용 목적
          </h2>
        </div>

        <IconCardGroup
          options={PURPOSE_OPTIONS}
          selected={purposes}
          onChange={setPurposes}
          multiple={true}
          cols={3}
        />
      </section>

      {/* ─── Section 2: 답변의 구체성 ────────────────── */}
      <section className="flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[8px]">
          {/* 빈 label placeholder (Figma와 동일하게 16px 높이 유지) */}
          <div className="h-[16px]" />
          <h2 className="text-[#191c1e] text-[20px] leading-[28px] font-normal">
            답변의 구체성
          </h2>
        </div>

        <IconCardGroup
          options={DETAIL_OPTIONS}
          selected={detailLevel ? [detailLevel] : []}
          onChange={(vals) => setDetailLevel(vals[0] ?? "")}
          multiple={false}
          cols={3}
        />
      </section>

      {/* ─── Actions ─────────────────────────────────── */}
      <div className="flex items-center justify-end pt-[24px]">
        <Button
          type="submit"
          variant="primary"
          rightIcon={<ArrowRight size={14} />}
        >
          계속하기
        </Button>
      </div>
    </form>
  );
}
