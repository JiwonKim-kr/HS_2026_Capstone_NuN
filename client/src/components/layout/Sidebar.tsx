"use client";

import { useState } from "react";
import { Menu, Plus, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // 긴 원본 텍스트 사용, 화면 표시 시 꼬리표(...) 적용
  const mockHistory = [
    "E-commerce Product Landing Page",
    "Python Script Optimization Request",
    "LinkedIn Thought Leadership Post",
    "Brainstorming Session for Marketing",
    "Code Refactoring Analysis"
  ];

  const visibleHistory = isHistoryExpanded ? mockHistory : mockHistory.slice(0, 3);
  const showMoreButton = mockHistory.length > 3;

  return (
    <aside className={`bg-[#f2f4f6] flex flex-col h-full items-start p-4 shrink-0 transition-all duration-300 relative z-30 ${isOpen ? 'w-[256px]' : 'w-[72px] items-center'}`}>
      <div className={`flex flex-col h-[37px] pb-4 w-full ${isOpen ? '' : 'items-center'}`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-md transition-colors shrink-0"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="pt-2 w-full flex justify-center">
        <a 
          href="/"
          title={!isOpen ? "새 채팅" : undefined}
          className={`bg-white hover:bg-gray-50 transition-colors flex ${isOpen ? 'gap-3 px-4' : 'justify-center px-0'} items-center py-3 rounded-lg shadow-sm w-full border border-gray-100`}
        >
          <Plus className="w-4 h-4 text-[#003e93] shrink-0" />
          {isOpen && <span className="font-medium text-[#003e93] text-sm whitespace-nowrap">새 채팅</span>}
        </a>
      </div>

      <div className="pt-2 w-full flex-grow">
        <div className="flex flex-col py-2 w-full items-center">
          {isOpen && (
            <div className="px-4 py-2 w-full text-left">
              <h3 className="text-[#757684] text-[11px] font-medium tracking-wide whitespace-nowrap">최근 대화 기록</h3>
            </div>
          )}
          
          <div className="flex flex-col gap-1 w-full max-h-[512px] overflow-y-auto mt-2 overflow-x-hidden">
            {visibleHistory.map((item, index) => (
              <button 
                key={index} 
                title={!isOpen ? item : undefined}
                className={`flex ${isOpen ? 'gap-3 px-4' : 'justify-center px-0'} items-center py-2.5 rounded-lg hover:bg-gray-200 transition-colors w-full text-left`}
              >
                <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                {isOpen && <span className="text-[#454652] truncate text-sm font-medium leading-normal pb-[2px]">{item}</span>}
              </button>
            ))}

            {showMoreButton && (
              <button 
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                title={!isOpen ? (isHistoryExpanded ? "간략히 보기" : "기록 더보기") : undefined}
                className={`flex ${isOpen ? 'gap-3 px-4' : 'justify-center px-0'} items-center py-2.5 mt-1 rounded-lg hover:bg-gray-200 transition-colors w-full text-left`}
              >
                {isHistoryExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
                {isOpen && (
                  <span className="text-gray-500 text-sm font-medium">
                    {isHistoryExpanded ? "간략히 보기" : "기록 더보기"}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
