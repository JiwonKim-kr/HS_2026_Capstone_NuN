"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { PreferenceForm, type PreferenceFormData } from "@/components/onboarding/preference-form";

const STEPS = [
  { number: 1, label: "기본 인적사항" },
  { number: 2, label: "주요 활용 목적" },
];

export default function OnboardingPage() {
  const router = useRouter();

  const handleSubmit = (data: PreferenceFormData) => {
    // TODO: 데이터 저장 후 2단계로 이동
    console.log("Onboarding step 1 data:", data);
    router.push("/onboarding/step2");
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={2}
      aside={
        <div className="flex flex-col gap-[32px]">
          {/* Title + description */}
          <div className="flex flex-col gap-[14.75px]">
            <h1 className="text-[#191c1e] text-[30px] leading-[37.5px] tracking-[-0.75px] font-normal font-[Actor,'Noto_Sans_KR',sans-serif]">
              나만의 AI 선호 모델<br />을 만들어보세요.
            </h1>
            <p className="text-[#454652] text-[14px] leading-[22.75px] font-normal">
              사용자 경험을 맞춤화하세요. 이 데이터는 귀하의 특정 전문 분야에 맞춰 Curator 엔진을 튜닝하는 데 사용됩니다.
            </p>
          </div>

          {/* Step nav */}
          <StepIndicator steps={STEPS} currentStep={1} />
        </div>
      }
    >
      <PreferenceForm onSubmit={handleSubmit} onSkip={handleSkip} />
    </OnboardingLayout>
  );
}
