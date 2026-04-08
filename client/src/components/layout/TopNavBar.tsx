"use client";

import { ChevronDown, User, PieChart, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export function TopNavBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="absolute backdrop-blur-[12px] bg-[#f8f9fb]/80 flex items-center justify-between left-0 px-6 py-4 top-0 w-full z-40 border-b border-transparent">
      <div className="flex items-center">
        <Link href="/">
          <h1 className="font-bold text-[#191c1e] text-[20px] tracking-[-1px] cursor-pointer hover:opacity-80 transition-opacity">
            Prompt-U
          </h1>
        </Link>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-[#f2f4f6] border border-slate-200/50 flex gap-2 items-center pl-[5px] pr-[13px] py-[5px] rounded-full hover:bg-slate-200 transition-colors shadow-sm"
        >
          <div className="bg-[#003e93]/10 rounded-full w-8 h-8 flex items-center justify-center border-2 border-white overflow-hidden shadow-sm">
            <User className="w-4 h-4 text-[#003e93]" />
          </div>
          <ChevronDown className={`w-[10px] h-[10px] text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-[224px] bg-white/90 backdrop-blur-md rounded-[12px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.08)] border border-[rgba(197,197,212,0.15)] overflow-hidden flex flex-col py-[9px]">
            {/* Account Info */}
            <div className="px-[16px] pb-[13px] pt-[12px] border-b border-[rgba(197,197,212,0.1)] flex flex-col gap-[2px]">
              <span className="text-[#64748b] text-[12px] font-medium tracking-[0.6px] uppercase">계정</span>
              <span className="text-[#191c1e] text-[14px] font-bold tracking-[-0.35px] truncate">prompt1234@gmail.com</span>
            </div>

            {/* Menu Items */}
            <div className="py-[4px] flex flex-col">
              <Link 
                href="/dashboard/profile" 
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-gray-50 transition-colors text-left w-full"
              >
                <User className="w-[14px] h-[14px] text-gray-700" />
                <span className="text-[#191c1e] text-[14px] tracking-[-0.35px]">프로필</span>
              </Link>
              <button className="flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-gray-50 transition-colors text-left w-full">
                <PieChart className="w-[14px] h-[14px] text-gray-700" />
                <span className="text-[#191c1e] text-[14px] tracking-[-0.35px]">분석</span>
              </button>
              <button className="flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-gray-50 transition-colors text-left w-full">
                <Settings className="w-[14px] h-[14px] text-gray-700" />
                <span className="text-[#191c1e] text-[14px] tracking-[-0.35px]">환경 설정</span>
              </button>
            </div>

            {/* Logout */}
            <div className="pt-[5px] pb-[4px] border-t border-[rgba(197,197,212,0.1)] mt-[2px]">
              <button className="flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-red-50 transition-colors text-left w-full group">
                <LogOut className="w-[14px] h-[14px] text-[#ba1a1a]" />
                <span className="text-[#ba1a1a] text-[14px] font-medium tracking-[-0.35px]">로그아웃</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
