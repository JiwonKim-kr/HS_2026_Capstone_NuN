"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { FormSection } from "@/components/ui/FormSection";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { ActionFooter } from "@/components/onboarding/ActionFooter";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State — DB에 저장되는 value는 언어에 무관하게 영문 키로 유지
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [job, setJob] = useState<string>("");
  
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>("concise");

  const handleNextStep = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      if (user) {
        const { error } = await supabase
          .from("users")
          .upsert({
            id: user.id,
            age_group: age,
            gender,
            job_role: job,
            primary_purpose: selectedPurposes.join(","),
            preferred_style: selectedStyle,
            is_onboarded: true,
          }, { onConflict: "id" });

        if (error) {
          console.error("온보딩 저장 오류:", error.message);
        }
      } else {
        console.warn("로그인된 사용자 정보가 없습니다.");
      }

      router.push("/dashboard");
    }
  };

  const handleSkip = () => {
    setCurrentStep(2);
  };

  const togglePurpose = (purpose: string) => {
    setSelectedPurposes(prev => 
      prev.includes(purpose)
        ? prev.filter(p => p !== purpose)
        : [...prev, purpose]
    );
  };

  // 번역된 라벨로 옵션 구성 (value는 영문 고정 → DB 저장 일관성 유지)
  const genderOptions = [
    { label: t("onboarding.gender.male"), value: "male" },
    { label: t("onboarding.gender.female"), value: "female" },
    { label: t("onboarding.gender.none"), value: "none" },
  ];

  const purposeOptions = [
    { label: t("onboarding.purpose.work"), value: "work", iconSrc: "/icons/work.svg" },
    { label: t("onboarding.purpose.study"), value: "study", iconSrc: "/icons/study.svg" },
    { label: t("onboarding.purpose.design"), value: "design", iconSrc: "/icons/design.svg" },
    { label: t("onboarding.purpose.it"), value: "it", iconSrc: "/icons/it.svg" },
    { label: t("onboarding.purpose.counseling"), value: "counseling", iconSrc: "/icons/counseling.svg" },
    { label: t("onboarding.purpose.general"), value: "general", iconSrc: "/icons/etc.svg" },
  ];

  const styleOptions = [
    { label: t("onboarding.style.concise"), value: "concise", iconSrc: "/icons/target.svg" },
    { label: t("onboarding.style.balanced"), value: "balanced", iconSrc: "/icons/balance.svg" },
    { label: t("onboarding.style.detailed"), value: "detailed", iconSrc: "/icons/detail.svg" },
  ];

  return (
    <OnboardingLayout currentStep={currentStep} onStepChange={setCurrentStep}>
      {currentStep === 1 ? (
        <div className="flex flex-col gap-[40px] w-full">
          {/* Step 1: 기본 정보 */}
          <FormSection label={t("onboarding.section.personal")} heading={t("onboarding.section.basic")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] sm:gap-[32px] w-full mt-[8px]">
              {/* 연령 */}
              <div className="flex flex-col gap-[8.5px]">
                <label className="text-[#454652] text-[14px]">{t("onboarding.age")}</label>
                <div className="bg-[#f2f4f6] h-[48px] rounded-[8px] flex items-center px-[12px] w-full border-2 border-transparent focus-within:border-[#003e93] transition-colors">
                  <input
                    type="number"
                    min="0"
                    value={age}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || Number(val) >= 0) setAge(val);
                    }}
                    placeholder="25"
                    className="bg-transparent border-none outline-none text-[16px] text-[#6b7280] w-full"
                  />
                </div>
              </div>
              {/* 성별 */}
              <div className="flex flex-col gap-[8.5px]">
                <label className="text-[#454652] text-[14px]">{t("onboarding.gender")}</label>
                <ToggleGroup 
                  options={genderOptions}
                  selectedValue={gender}
                  onChange={setGender}
                />
              </div>
            </div>
          </FormSection>

          {/* Step 1: 커리어 맥락 */}
          <FormSection label={t("onboarding.section.career")} heading={t("onboarding.section.career.q")}>
            <div className="mt-[8px] relative w-full">
              <div className="bg-[#f2f4f6] h-[48px] rounded-[8px] flex items-center px-[16px] relative w-full focus-within:border-[#003e93] border-2 border-transparent transition-colors">
                <select
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  className="bg-transparent border-none outline-none text-[16px] text-[#191c1e] w-full appearance-none cursor-pointer"
                >
                  <option value="" disabled>{t("onboarding.job.placeholder")}</option>
                  <option value="student">{t("onboarding.job.student")}</option>
                  <option value="developer">{t("onboarding.job.developer")}</option>
                  <option value="designer">{t("onboarding.job.designer")}</option>
                  <option value="planner">{t("onboarding.job.planner")}</option>
                  <option value="marketer">{t("onboarding.job.marketer")}</option>
                  <option value="other">{t("onboarding.job.other")}</option>
                </select>
                <div className="absolute right-[16px] size-[24px] pointer-events-none">
                  <Image src="/icons/chevron-down.svg" alt="Dropdown" fill className="object-contain" />
                </div>
              </div>
            </div>
          </FormSection>

          <ActionFooter 
            onNext={handleNextStep} 
            onSkip={handleSkip} 
          />
        </div>
      ) : (
        <div className="flex flex-col gap-[40px] w-full">
          {/* Step 2: 주요 활용 목적 */}
          <FormSection label={t("onboarding.section.customize")} heading={t("onboarding.section.purpose")}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-[12px] mt-[8px] w-full">
              {purposeOptions.map(option => (
                <SelectableCard
                  key={option.value}
                  label={option.label}
                  iconSrc={option.iconSrc}
                  isSelected={selectedPurposes.includes(option.value)}
                  onClick={() => togglePurpose(option.value)}
                  height="84px"
                />
              ))}
            </div>
          </FormSection>

          {/* Step 2: 답변 스타일 */}
          <FormSection label="" heading={t("onboarding.section.style")}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-[12px] mt-[8px] w-full">
              {styleOptions.map(option => (
                <SelectableCard
                  key={option.value}
                  label={option.label}
                  iconSrc={option.iconSrc}
                  isSelected={selectedStyle === option.value}
                  onClick={() => setSelectedStyle(option.value)}
                  height="84px"
                />
              ))}
            </div>
          </FormSection>

          <ActionFooter 
            onNext={handleNextStep}
            isLastStep={true}
            disabled={selectedPurposes.length === 0}
          />
        </div>
      )}
    </OnboardingLayout>
  );
}
