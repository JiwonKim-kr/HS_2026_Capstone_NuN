"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface PreferenceFormProps {
  onSubmit?: (data: PreferenceFormData) => void;
  onSkip?: () => void;
}

export interface PreferenceFormData {
  age: string;
  gender: string;
  jobCategory: string;
}

const JOB_OPTIONS = [
  { value: "developer", label: "개발자 / 엔지니어" },
  { value: "designer", label: "디자이너" },
  { value: "marketer", label: "마케터 / 기획자" },
  { value: "researcher", label: "연구원 / 학생" },
  { value: "manager", label: "경영 / 관리직" },
  { value: "creator", label: "크리에이터 / 콘텐츠" },
  { value: "other", label: "기타" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
];

export function PreferenceForm({ onSubmit, onSkip }: PreferenceFormProps) {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [jobCategory, setJobCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ age, gender, jobCategory });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[40px] w-full">

      {/* ─── Section 1: 기본 정보 ─────────────────── */}
      <section className="flex flex-col gap-[24px]">
        {/* Section heading */}
        <div className="flex flex-col gap-[8px]">
          <span className="text-[#757684] text-[12px] tracking-[0.6px] uppercase leading-[16px]">
            개인 식별
          </span>
          <h2 className="text-[#191c1e] text-[20px] leading-[28px] font-normal">
            기본 정보
          </h2>
        </div>

        {/* Grid: 연령 + 성별 */}
        <div className="grid grid-cols-2 gap-x-[32px] gap-y-[32px]">
          <Input
            label="연령"
            type="number"
            placeholder="25"
            min={1}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <ToggleGroup
            label="성별"
            options={GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
          />
        </div>
      </section>

      {/* ─── Section 2: 커리어 맥락 ──────────────── */}
      <section className="flex flex-col gap-[24px]">
        {/* Section heading */}
        <div className="flex flex-col gap-[8px]">
          <span className="text-[#757684] text-[12px] tracking-[0.6px] uppercase leading-[16px]">
            커리어 맥락
          </span>
          <h2 className="text-[#191c1e] text-[20px] leading-[28px] font-normal">
            현재 어떤 일을 하시나요?
          </h2>
        </div>

        <Select
          placeholder="직업군 선택"
          options={JOB_OPTIONS}
          value={jobCategory}
          onChange={setJobCategory}
        />
      </section>

      {/* ─── Actions ─────────────────────────────── */}
      <div className="flex items-center justify-between pt-[24px]">
        <Button
          type="submit"
          variant="primary"
          rightIcon={<ArrowRight size={14} />}
        >
          계속하기
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSkip}
        >
          건너뛰기
        </Button>
      </div>
    </form>
  );
}
