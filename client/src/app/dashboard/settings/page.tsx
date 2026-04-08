"use client";

import { useState } from "react";
import Image from "next/image";
import { Globe, ShieldCheck, AlertTriangle, ChevronDown } from "lucide-react";

export default function SettingsPage() {
  const [language, setLanguage] = useState("ko");

  const handleDeleteAccount = () => {
    alert("계정 영구 삭제 로직 (TODO: 연동 필요)");
  };

  return (
    <div className="flex flex-col gap-[48px] items-start w-full max-w-[896px] py-[40px] mx-auto z-10 relative">
      {/* Header Section */}
      <div className="flex flex-col gap-[8px] w-full">
        <h2 className="text-[#191c1e] text-[30px] tracking-[-0.75px] leading-[36px]">
          환경 설정
        </h2>
        <p className="text-[#454652] text-[16px] leading-[24px]">
          계정 설정 및 플랫폼 환경을 개인화할 수 있습니다.
        </p>
      </div>

      <div className="flex flex-col gap-[32px] w-full">
        
        {/* Section 1: Language Change */}
        <section className="bg-white p-[32px] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[24px] w-full">
          <div className="flex items-start gap-[12px] w-full max-w-[285.8px]">
            <Globe className="w-[20px] h-[20px] text-[#454652] shrink-0 mt-[4px]" />
            <div className="flex flex-col gap-[4px] w-full">
              <h3 className="text-[#191c1e] text-[18px] leading-[28px]">언어 설정</h3>
              <p className="text-[#454652] text-[14px] leading-[20px]">
                인터페이스에 표시될 기본 언어를 선택하세요.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-[240px]">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#f2f4f6] text-[#191c1e] font-medium text-[16px] h-[48px] w-full rounded-[8px] pl-[16px] pr-[40px] appearance-none outline-none focus:ring-2 focus:ring-[#003e93]/50 transition-shadow cursor-pointer"
            >
              <option value="ko">한국어 (Korean)</option>
              <option value="en">English (US)</option>
            </select>
            <ChevronDown className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#454652] pointer-events-none" />
          </div>
        </section>

        {/* Section 2: Privacy Policy */}
        <section className="bg-white p-[32px] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col gap-[24px] w-full">
          <div className="flex items-center gap-[12px] w-full">
            <div className="bg-[#dfe0ff] w-[40px] h-[40px] rounded-[8px] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-[20px] h-[20px] text-[#003e93]" />
            </div>
            <h3 className="text-[#191c1e] text-[18px] leading-[28px]">개인정보 처리방침</h3>
          </div>

          {/* 스크롤 가능한 처리방침 박스 */}
          <div className="bg-[#f2f4f6] h-[160px] rounded-[8px] p-[24px] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-[#d1d5db] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="flex flex-col gap-[22px] text-[#454652] text-[14px] leading-[22.75px]">
              <p>
                Intelligence Layer는 사용자의 개인정보 보호를 최우선으로 생각합니다. 당사는 서비스 제공을 위해 필요한 최소한의 데이터만을 수집하며, 모든 데이터는 최신 암호화 표준을 통해 안전하게 관리됩니다.
              </p>
              <div>
                <p>1. 수집하는 개인정보 항목: 이메일, 회사 정보, 서비스 이용 기록.</p>
                <p>2. 수집 목적: 맞춤형 AI 큐레이션 서비스 제공 및 사용자 인증.</p>
                <p>3. 보유 기간: 회원 탈퇴 시 혹은 법적 보관 의무 기간 종료 시까지.</p>
              </div>
              <p>상세한 내용은 '전문 보기' 링크를 통해 확인하실 수 있습니다.</p>
              
              {/* 스크롤 확인용 더미 데이터 반복 */}
              <div className="h-[1px] bg-slate-300 w-full my-4" />
              <p className="text-gray-400 italic">(이하 스크롤 확인용 더미 텍스트)</p>
              <p>
                당사는 개인정보보호법 및 관련 법령을 철저히 준수합니다. 본 방침은 추가적인 서비스를 적용할 때 언제든 수정될 수 있으며, 수정 시에는 공지사항을 통해 사전 안내해 드립니다. 사용자의 권익 보호를 위해 투명하고 공정한 데이터 활용 원칙을 마련하고 있습니다.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Account Deletion */}
        <section className="bg-[rgba(255,218,214,0.1)] border border-[rgba(255,218,214,0.2)] p-[32px] rounded-[12px] flex items-start gap-[16px] w-full transition-colors hover:bg-[rgba(255,218,214,0.15)]">
          <div className="bg-[#ba1a1a]/10 w-[38px] h-[35px] rounded-[8px] flex items-center justify-center shrink-0 mt-[4px]">
            <AlertTriangle className="w-[18px] h-[18px] text-[#ba1a1a]" />
          </div>
          
          <div className="flex flex-col gap-[16px] w-full">
            <div className="flex flex-col gap-[8px]">
              <h3 className="text-[#93000a] text-[18px] leading-[28px]">계정 삭제</h3>
              <div className="text-[#454652] text-[14px] leading-[20px]">
                <p>계정을 삭제하면 모든 분석 데이터, 설정 및 큐레이션 기록이 영구적으로 제거됩니다.</p>
                <p>이 작업은 되돌릴 수 없으므로 주의하시기 바랍니다.</p>
              </div>
            </div>

            <button 
              onClick={handleDeleteAccount}
              className="bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[14px] h-[40px] px-[24px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-fit transition-colors flex items-center justify-center"
            >
              계정 영구 삭제
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
