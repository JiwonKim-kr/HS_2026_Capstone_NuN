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

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [age, setAge] = useState<string>("25");
  const [gender, setGender] = useState<string>("남성");
  const [job, setJob] = useState<string>("");
  
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>("핵심만 간결하게");

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

  const genderOptions = [
    { label: "남성", value: "남성" },
    { label: "여성", value: "여성" },
  ];

  const purposeOptions = [
    { label: "업무/기획", value: "업무/기획", iconSrc: "/icons/work.svg" },
    { label: "학업/연구", value: "학업/연구", iconSrc: "/icons/study.svg" },
    { label: "디자인/예술", value: "디자인/예술", iconSrc: "/icons/design.svg" },
    { label: "IT/개발", value: "IT/개발", iconSrc: "/icons/it.svg" },
    { label: "상담/심리", value: "상담/심리", iconSrc: "/icons/counseling.svg" },
    { label: "일반/기타", value: "일반/기타", iconSrc: "/icons/etc.svg" },
  ];

  const styleOptions = [
    { label: "핵심만 간결하게", value: "핵심만 간결하게", iconSrc: "/icons/target.svg" },
    { label: "균형있는 설명", value: "균형있는 설명", iconSrc: "/icons/balance.svg" },
    { label: "아주 디테일하게", value: "아주 디테일하게", iconSrc: "/icons/detail.svg" },
  ];

  return (
    <OnboardingLayout currentStep={currentStep}>
      {currentStep === 1 ? (
        <div className="flex flex-col gap-[40px] w-full">
          {/* Step 1: 기본 정보 */}
          <FormSection label="개인 식별" heading="기본 정보">
            <div className="grid grid-cols-2 gap-[32px] w-full mt-[8px]">
              {/* 연령 */}
              <div className="flex flex-col gap-[8.5px]">
                <label className="text-[#454652] text-[14px]">연령</label>
                <div className="bg-[#f2f4f6] h-[48px] rounded-[8px] flex items-center px-[12px] w-full border-2 border-transparent focus-within:border-[#003e93] transition-colors">
                  <input 
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="bg-transparent border-none outline-none text-[16px] text-[#6b7280] w-full"
                  />
                </div>
              </div>
              {/* 성별 */}
              <div className="flex flex-col gap-[8.5px]">
                <label className="text-[#454652] text-[14px]">성별</label>
                <ToggleGroup 
                  options={genderOptions}
                  selectedValue={gender}
                  onChange={setGender}
                />
              </div>
            </div>
          </FormSection>

          {/* Step 1: 커리어 맥락 */}
          <FormSection label="커리어 맥락" heading="현재 어떤 일을 하시나요?">
            <div className="mt-[8px] relative w-full">
              <div className="bg-[#f2f4f6] h-[48px] rounded-[8px] flex items-center px-[16px] relative w-full focus-within:border-[#003e93] border-2 border-transparent transition-colors">
                <select
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  className="bg-transparent border-none outline-none text-[16px] text-[#191c1e] w-full appearance-none cursor-pointer"
                >
                  <option value="" disabled>직업군 선택</option>
                  <option value="학생">학생</option>
                  <option value="개발자">개발자</option>
                  <option value="디자이너">디자이너</option>
                  <option value="기획자">기획자</option>
                  <option value="마케터">마케터</option>
                  <option value="기타">기타</option>
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
          <FormSection label="맞춤 설정" heading="주요 활용 목적">
            <div className="grid grid-cols-3 gap-[12px] mt-[8px] w-full">
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
          <FormSection label="" heading="답변 스타일">
            <div className="grid grid-cols-3 gap-[12px] mt-[8px] w-full">
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
          />
        </div>
      )}
    </OnboardingLayout>
  );
}
