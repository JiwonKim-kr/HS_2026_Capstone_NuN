"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { useAuth } from "@/lib/auth/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface UserProfileData {
  age_group: string;
  gender: string;
  job_role: string;
  primary_purpose: string;
  preferred_style: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
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
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) { setIsLoading(false); return; }
      const { data, error } = await supabase
        .from("users").select("*").eq("id", user.id).single();
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
    const { error } = await supabase.from("users").update(userData).eq("id", user.id);
    if (!error) {
      setOriginalData(userData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      console.error("프로필 업데이트 실패:", error);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    if (originalData) setUserData(originalData);
  };

  const purposeOptions = [
    { label: t("profile.purpose.work"),       value: "업무/기획",   iconSrc: "/icons/work.svg" },
    { label: t("profile.purpose.study"),      value: "학업/연구",   iconSrc: "/icons/study.svg" },
    { label: t("profile.purpose.design"),     value: "디자인/예술", iconSrc: "/icons/design.svg" },
    { label: t("profile.purpose.it"),         value: "IT/개발",     iconSrc: "/icons/it.svg" },
    { label: t("profile.purpose.counseling"), value: "상담/심리",   iconSrc: "/icons/counseling.svg" },
    { label: t("profile.purpose.general"),    value: "일반/기타",   iconSrc: "/icons/etc.svg" },
  ];

  const styleOptions = [
    { label: t("profile.style.concise"),  value: "핵심만 간결하게", iconSrc: "/icons/target.svg" },
    { label: t("profile.style.balanced"), value: "균형있는 설명",   iconSrc: "/icons/balance.svg" },
    { label: t("profile.style.detailed"), value: "아주 디테일하게", iconSrc: "/icons/detail.svg" },
  ];

  if (isLoading) {
    return <div className="w-full flex justify-center py-20 text-gray-500">{t("profile.loading")}</div>;
  }

  const isDirty = originalData && JSON.stringify(originalData) !== JSON.stringify(userData);
  const purposesArray = userData.primary_purpose ? userData.primary_purpose.split(",") : [];

  return (
    <div className="flex flex-col gap-[40px] items-start w-full max-w-[896px] py-[48px] mx-auto z-10 relative pb-32">
      {/* Header */}
      <div className="flex flex-col gap-[8px] w-full">
        <p className="text-[#6b7280] text-[16px] leading-[24px]">
          {t("profile.subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-[32px] w-full relative">

        {/* Section 1: Basic Info */}
        <section className="bg-white p-[32px] rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] flex flex-col gap-[24px] w-full">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[#9ca3af] text-[11px] font-bold tracking-[1.1px] uppercase">{t("profile.personal_info")}</span>
            <h3 className="text-[#1f2937] text-[20px] font-bold leading-[28px]">{t("profile.basic_info")}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[24px] w-full">
            {/* Age */}
            <div className="flex flex-col gap-[8px]">
              <label className="text-[#374151] text-[14px] font-medium leading-[20px]">{t("profile.age")}</label>
              <div className="bg-[#f9fafb] px-[16px] py-[12px] rounded-[12px] border border-transparent focus-within:border-[#003e93] transition-colors flex items-center">
                <input
                  type="number"
                  value={userData.age_group}
                  onChange={(e) => setUserData({ ...userData, age_group: e.target.value })}
                  className="bg-transparent border-none outline-none text-[#1f2937] text-[16px] leading-[24px] w-full"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[4px] h-[20px]">
                <label className="text-[#374151] text-[14px] font-medium leading-[20px]">{t("profile.gender")}</label>
              </div>
              <div className="bg-[#f3f4f6] p-[4px] rounded-[12px] flex items-center w-full">
                <button
                  onClick={() => setUserData({ ...userData, gender: "남성" })}
                  className={`flex-1 py-[8px] rounded-[8px] flex items-center justify-center transition-colors ${userData.gender === '남성' ? 'bg-white shadow-sm text-[#1d4ed8] font-medium' : 'text-[#9ca3af] hover:text-[#4b5563]'}`}
                >
                  {t("profile.gender.male")}
                </button>
                <button
                  onClick={() => setUserData({ ...userData, gender: "여성" })}
                  className={`flex-1 py-[8px] rounded-[8px] flex items-center justify-center transition-colors ${userData.gender === '여성' ? 'bg-white shadow-sm text-[#1d4ed8] font-medium' : 'text-[#9ca3af] hover:text-[#4b5563]'}`}
                >
                  {t("profile.gender.female")}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[4px] pt-[8px] w-full">
            <span className="text-[#9ca3af] text-[11px] font-bold tracking-[1.1px] uppercase">{t("profile.job_label")}</span>
            <h4 className="text-[#1f2937] text-[18px] font-bold leading-[28px] pb-[12px]">{t("profile.job_q")}</h4>
            <div className="bg-[#f9fafb] h-[56px] rounded-[12px] w-full relative flex items-center px-[16px] border border-transparent hover:border-gray-200 focus-within:border-[#003e93] transition-colors">
              <select
                value={userData.job_role}
                onChange={(e) => setUserData({ ...userData, job_role: e.target.value })}
                className="bg-transparent border-none outline-none text-[#4b5563] text-[16px] leading-[24px] w-full appearance-none cursor-pointer"
              >
                <option value="" disabled>{t("profile.job.placeholder")}</option>
                <option value="학생">{t("profile.job.student")}</option>
                <option value="개발자">{t("profile.job.developer")}</option>
                <option value="디자이너">{t("profile.job.designer")}</option>
                <option value="기획자">{t("profile.job.planner")}</option>
                <option value="마케터">{t("profile.job.marketer")}</option>
                <option value="기타">{t("profile.job.other")}</option>
              </select>
              <div className="absolute right-[16px] w-[24px] h-[24px] pointer-events-none">
                <Image src="/icons/chevron-down.svg" alt="Drop Down" fill className="object-contain" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Purpose */}
        <section className="bg-white p-[32px] rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] flex flex-col gap-[24px] w-full">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[#9ca3af] text-[11px] font-bold tracking-[1.1px] uppercase">{t("profile.customization")}</span>
            <h3 className="text-[#1f2937] text-[20px] font-bold leading-[28px]">{t("profile.purpose_title")}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-[16px] w-full">
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

        {/* Section 3: Style */}
        <section className="bg-white p-[32px] rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] flex flex-col gap-[24px] w-full">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[#9ca3af] text-[11px] font-bold tracking-[1.1px] uppercase">{t("profile.style_specificity")}</span>
            <h3 className="text-[#1f2937] text-[20px] font-bold leading-[28px]">{t("profile.style_title")}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-[16px] w-full">
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

        {/* Save / Cancel */}
        {isDirty && (
          <div className="flex justify-end gap-3 mt-4 w-full">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-[8px] bg-white border border-[#c5c5d4] text-[#454652] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {t("profile.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-[8px] bg-[#3f51b5] text-white font-semibold hover:bg-[#3949a3] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? t("profile.saving") : t("profile.apply")}
            </button>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && !isDirty && (
          <div className="flex justify-end mt-4 w-full">
            <div className="bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] px-4 py-2.5 rounded-[8px] flex items-center gap-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span className="text-[14px] font-semibold">{t("profile.saved")}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
