"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { SelectableCard } from "@/components/ui/SelectableCard";

// 임의의 Mocking 데이터 인터페이스 (추후 서버 API 연동 상정)
interface UserProfileData {
  userName: string | null;
  age: string;
  gender: string;
  job: string;
  purposes: string[];
  style: string;
}

export default function ProfilePage() {
  // 실제 프로덕션에서는 SWR, React Query 또는 전역 상태(Context/Zustand)로 데이터를 불러옵니다.
  const [userData, setUserData] = useState<UserProfileData>({
    userName: null, // 데이터를 받지 못했음을 알리기 위해 기본값 null
    age: "25",
    gender: "남성",
    job: "IT / 소프트웨어 개발",
    purposes: ["업무/기획"],
    style: "핵심만 간결하게",
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // API 호출 시뮬레이션
    const timer = setTimeout(() => {
      setUserData(prev => ({ ...prev, userName: "{userName}" })); // 실제 데이터가 없을 때 {userName} 형태로 노출
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const togglePurpose = (purpose: string) => {
    setUserData(prev => ({
      ...prev,
      purposes: prev.purposes.includes(purpose)
        ? prev.purposes.filter(p => p !== purpose)
        : [...prev.purposes, purpose]
    }));
  };

  const setStyle = (style: string) => {
    setUserData(prev => ({ ...prev, style }));
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

  return (
    <div className="flex flex-col gap-[40px] items-start w-full max-w-[896px] py-[48px] mx-auto z-10 relative">
      {/* Header */}
      <div className="flex flex-col gap-[8px] w-full">
        <h2 className="text-[#111827] text-[30px] font-bold leading-[36px]">
          안녕하세요 {userData.userName || "___"}님.
        </h2>
        <p className="text-[#6b7280] text-[16px] leading-[24px]">
          사용자 경험을 맞춤화하세요. 이 데이터는 귀하의 특정 전문 분야에 맞춰 프롬프트를 튜닝하는 데 사용됩니다.
        </p>
      </div>

      <div className="flex flex-col gap-[32px] w-full">

        {/* Section 1: 기본 정보 */}
        <section className="bg-white p-[32px] rounded-[16px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] flex flex-col gap-[24px] w-full">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[#9ca3af] text-[11px] font-bold tracking-[1.1px] uppercase">개인 정보</span>
            <h3 className="text-[#1f2937] text-[20px] font-bold leading-[28px]">기본 정보</h3>
          </div>

          <div className="grid grid-cols-2 gap-[24px] w-full">
            {/* 연령 (수정 불가) */}
            <div className="flex flex-col gap-[8px]">
              <label className="text-[#374151] text-[14px] font-medium leading-[20px]">연령</label>
              <div className="bg-[#f9fafb] px-[16px] py-[12px] rounded-[12px] opacity-80 cursor-not-allowed">
                <span className="text-[#1f2937] text-[16px] leading-[24px]">{userData.age}</span>
              </div>
            </div>

            {/* 성별 (수정 불가) */}
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center gap-[4px] h-[20px]">
                <label className="text-[#374151] text-[14px] font-medium leading-[20px]">성별</label>
                <span className="text-[#9ca3af] text-[10px] leading-[20px]">(수정 불가)</span>
              </div>
              <div className="bg-[#f3f4f6] p-[4px] rounded-[12px] flex items-center w-full cursor-not-allowed opacity-80">
                <div className={`flex-1 py-[8px] rounded-[8px] flex items-center justify-center ${userData.gender === '남성' ? 'bg-white shadow-sm text-[#1d4ed8] font-medium' : 'text-[#9ca3af]'}`}>
                  남성
                </div>
                <div className={`flex-1 py-[8px] rounded-[8px] flex items-center justify-center ${userData.gender === '여성' ? 'bg-white shadow-sm text-[#1d4ed8] font-medium' : 'text-[#9ca3af]'}`}>
                  여성
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[4px] pt-[8px] w-full">
            <span className="text-[#9ca3af] text-[11px] font-bold tracking-[1.1px] uppercase">직업</span>
            <h4 className="text-[#1f2937] text-[18px] font-bold leading-[28px] pb-[12px]">현재 어떤 일을 하시나요?</h4>

            <div className="bg-[#f9fafb] h-[56px] rounded-[12px] w-full relative flex items-center px-[16px] cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
              <span className="text-[#4b5563] text-[16px] leading-[24px]">{userData.job}</span>
              <div className="absolute right-[16px] w-[24px] h-[24px]">
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
                isSelected={userData.purposes.includes(option.value)}
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
                isSelected={userData.style === option.value}
                onClick={() => setStyle(option.value)}
                height="116px"
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
