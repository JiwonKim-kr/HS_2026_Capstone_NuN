"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { PurposeForm, type PurposeFormData } from "@/components/onboarding/purpose-form";

const STEPS = [
  { number: 1, label: "기본 인적사항" },
  { number: 2, label: "주요 활용 목적" },
];

export default function OnboardingStep2Page() {
  const router = useRouter();

  const handleSubmit = (data: PurposeFormData) => {
    // TODO: 온보딩 완료 후 메인 페이지 또는 완료 페이지로 이동
    console.log("Onboarding step 2 data:", data);
    router.push("/");
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={2}
      aside={
        <div className="flex flex-col gap-[32px]">
          {/* Title + description */}
          <div className="flex flex-col gap-[14.75px]">
            <h1 className="text-[#191c1e] text-[30px] leading-[37.5px] tracking-[-0.75px] font-normal">
              나만의 AI 선호 모델<br />을 만들어보세요.
            </h1>
            <p className="text-[#454652] text-[14px] leading-[22.75px] font-normal">
              사용자 경험을 맞춤화하세요. 이 데이터는 귀하의 특정 전문 분야에 맞춰 Curator 엔진을 튜닝하는 데 사용됩니다.
            </p>
          </div>

          {/* Step nav — step 1 이미 완료, step 2 활성 */}
          <StepIndicator steps={STEPS} currentStep={2} />
        </div>
      }
    >
      <PurposeForm onSubmit={handleSubmit} />
    </OnboardingLayout>
  );
}
