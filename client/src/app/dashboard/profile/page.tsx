"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { useAuth } from "@/lib/auth/AuthProvider";
import { supabase } from "@/lib/supabase/client";

interface UserProfileData {
  age_group: string;
  gender: string;
  job_role: string;
  primary_purpose: string;
  preferred_style: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [originalData, setOriginalData] = useState<UserProfileData | null>(null);
  const [userData, setUserData] = useState<UserProfileData>({
    age_group: "25",
    gender: "남성",
    job_role: "",
    primary_purpose: "",
    preferred_style: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        const fetchedData = {
          age_group: data.age_group || "25",
          gender: data.gender || "남성",
          job_role: data.job_role || "",
          primary_purpose: data.primary_purpose || "",
          preferred_style: data.preferred_style || "",
        };
        setOriginalData(fetchedData);
        setUserData(fetchedData);
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, [user]);

  const togglePurpose = (purpose: string) => {
    setUserData(prev => {
      // Split purpose by comma if multiple are supported, but here it seems the user uses singular or comma-separated.
      // In onboarding, it used `join(",")`. We will handle it as an array inside the component, but string in state.
      const purposes = prev.primary_purpose ? prev.primary_purpose.split(",") : [];
      const newPurposes = purposes.includes(purpose)
        ? purposes.filter(p => p !== purpose)
        : [...purposes, purpose];
      return { ...prev, primary_purpose: newPurposes.join(",") };
    });
  };

  const setStyle = (style: string) => {
    setUserData(prev => ({ ...prev, preferred_style: style }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", user.id);

    if (!error) {
      setOriginalData(userData);
    } else {
      console.error("프로필 업데이트 실패:", error);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    if (originalData) {
      setUserData(originalData);
    }
  };

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

  if (isLoading) {
    return <div className="w-full flex justify-center py-20 text-gray-500">데이터를 불러오는 중...</div>;
  }

  const isDirty = originalData && JSON.stringify(originalData) !== JSON.stringify(userData);
  const purposesArray = userData.primary_purpose ? userData.primary_purpose.split(",") : [];

  return (
    <div className="flex flex-col gap-[40px] items-start w-full max-w-[896px] py-[48px] mx-auto z-10 relative pb-32">
      {/* Header */}
      <div className="flex flex-col gap-[8px] w-full">
        <p className="text-[#6b7280] text-[16px] leading-[24px]">
          사용자 경험을 맞춤화하세요. 이 데이터는 귀하의 특정 전문 분야에 맞춰 프롬프트를 튜닝하는 데 사용됩니다.
        </p>
      </div>

      <div className="flex flex-col gap-[32px] w-full relative">

        {/* Section 1: 기본 정보 */}
        <section className="bg-white p-[32px] rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] flex flex-col gap-[24px] w-full">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[#9ca3af] text-[11px] font-bold tracking-[1.1px] uppercase">개인 정보</span>
            <h3 className="text-[#1f2937] text-[20px] font-bold leading-[28px]">기본 정보</h3>
          </div>

          <div className="grid grid-cols-2 gap-[24px] w-full">
            {/* 연령 (수정 가능) */}
            <div className="flex flex-col gap-[8px]">
              <label className="text-[#374151] text-[14px] font-medium leading-[20px]">연령</label>
              <div className="bg-[#f9fafb] px-[16px] py-[12px] rounded-[12px] border border-transparent focus-within:border-[#003e93] transition-colors flex items-center">
                <input
                  type="number"
                  value={userData.age_group}
                  onChange={(e) => setUserData({ ...userData, age_group: e.target.value })}
                  className="bg-transparent border-none outline-none text-[#1f2937] text-[16px] leading-[24px] w-full"
                />
              </div>
            </div>

            {/* 성별 (수정 가능) */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[4px] h-[20px]">
                <label className="text-[#374151] text-[14px] font-medium leading-[20px]">성별</label>
              </div>
              <div className="bg-[#f3f4f6] p-[4px] rounded-[12px] flex items-center w-full">
                <button
                  onClick={() => setUserData({ ...userData, gender: "남성" })}
                  className={`flex-1 py-[8px] rounded-[8px] flex items-center justify-center transition-colors ${userData.gender === '남성' ? 'bg-white shadow-sm text-[#1d4ed8] font-medium' : 'text-[#9ca3af] hover:text-[#4b5563]'}`}
                >
                  남성
                </button>
                <button
                  onClick={() => setUserData({ ...userData, gender: "여성" })}
                  className={`flex-1 py-[8px] rounded-[8px] flex items-center justify-center transition-colors ${userData.gender === '여성' ? 'bg-white shadow-sm text-[#1d4ed8] font-medium' : 'text-[#9ca3af] hover:text-[#4b5563]'}`}
                >
                  여성
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[4px] pt-[8px] w-full">
            <span className="text-[#9ca3af] text-[11px] font-bold tracking-[1.1px] uppercase">직업</span>
            <h4 className="text-[#1f2937] text-[18px] font-bold leading-[28px] pb-[12px]">현재 어떤 일을 하시나요?</h4>

            <div className="bg-[#f9fafb] h-[56px] rounded-[12px] w-full relative flex items-center px-[16px] border border-transparent hover:border-gray-200 focus-within:border-[#003e93] transition-colors">
              <select
                value={userData.job_role}
                onChange={(e) => setUserData({ ...userData, job_role: e.target.value })}
                className="bg-transparent border-none outline-none text-[#4b5563] text-[16px] leading-[24px] w-full appearance-none cursor-pointer"
              >
                <option value="" disabled>직업군 선택</option>
                <option value="학생">학생</option>
                <option value="개발자">개발자</option>
                <option value="디자이너">디자이너</option>
                <option value="기획자">기획자</option>
                <option value="마케터">마케터</option>
                <option value="기타">기타</option>
              </select>
              <div className="absolute right-[16px] w-[24px] h-[24px] pointer-events-none">
                <Image src="/icons/chevron-down.svg" alt="Drop Down" fill className="object-contain" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: 주요 활용 목적 */}
        <section className="bg-white p-[32px] rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] flex flex-col gap-[24px] w-full">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[#9ca3af] text-[11px] font-bold tracking-[1.1px] uppercase">맞춤 설정</span>
            <h3 className="text-[#1f2937] text-[20px] font-bold leading-[28px]">주요 활용 목적</h3>
          </div>

          <div className="grid grid-cols-3 gap-[16px] w-full">
            {purposeOptions.map(option => (
              <SelectableCard
                key={option.value}
                label={option.label}
                iconSrc={option.iconSrc}
                isSelected={purposesArray.includes(option.value)}
                onClick={() => togglePurpose(option.value)}
                height="124px"
              />
            ))}
          </div>
        </section>

        {/* Section 3: 답변 스타일 */}
        <section className="bg-white p-[32px] rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] flex flex-col gap-[24px] w-full">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[#9ca3af] text-[11px] font-bold tracking-[1.1px] uppercase">답변의 구체성</span>
            <h3 className="text-[#1f2937] text-[20px] font-bold leading-[28px]">답변 스타일</h3>
          </div>

          <div className="grid grid-cols-3 gap-[16px] w-full">
            {styleOptions.map(option => (
              <SelectableCard
                key={option.value}
                label={option.label}
                iconSrc={option.iconSrc}
                isSelected={userData.preferred_style === option.value}
                onClick={() => setStyle(option.value)}
                height="116px"
              />
            ))}
          </div>
        </section>

        {/* 하단 적용/취소 버튼 */}
        {isDirty && (
          <div className="flex justify-end gap-3 mt-4 w-full">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-[8px] bg-white border border-[#c5c5d4] text-[#454652] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소 (되돌리기)
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-[8px] bg-[#3f51b5] text-white font-semibold hover:bg-[#3949a3] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? "저장 중..." : "적용하기"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
