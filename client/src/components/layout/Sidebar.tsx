"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

interface SessionData {
  sessionId: string;
  title: string;
  createdAt: string;
}

export function Sidebar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [history, setHistory] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/prompts/history?userId=${user.id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setHistory(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();

    const handlePromptGenerated = () => {
      fetchHistory();
    };

    window.addEventListener('prompt-generated', handlePromptGenerated);
    return () => {
      window.removeEventListener('prompt-generated', handlePromptGenerated);
    };
  }, [user?.id]);

  const visibleHistory = isHistoryExpanded ? history : history.slice(0, 3);
  const showMoreButton = history.length > 3;

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
        <Link 
          href="/dashboard"
          title={!isOpen ? "새 채팅" : undefined}
          className={`bg-white hover:bg-gray-50 transition-colors flex ${isOpen ? 'gap-3 px-4' : 'justify-center px-0'} items-center py-3 rounded-lg shadow-sm w-full border border-gray-100`}
        >
          <Plus className="w-4 h-4 text-[#003e93] shrink-0" />
          {isOpen && <span className="font-medium text-[#003e93] text-sm whitespace-nowrap">새 채팅</span>}
        </Link>
      </div>

      <div className="pt-2 w-full flex-grow">
        <div className="flex flex-col py-2 w-full items-center">
          {isOpen && (
            <div className="px-4 py-2 w-full text-left">
              <h3 className="text-[#757684] text-[11px] font-medium tracking-wide whitespace-nowrap">최근 대화 기록</h3>
            </div>
          )}
          
          <div className="flex flex-col gap-1 w-full max-h-[512px] overflow-y-auto mt-2 overflow-x-hidden">
            {isLoading ? (
              isOpen && <div className="px-4 py-2 text-sm text-gray-400">로딩 중...</div>
            ) : history.length === 0 ? (
              isOpen && <div className="px-4 py-2 text-sm text-gray-400">기록이 없습니다.</div>
            ) : (
              visibleHistory.map((session) => {
                const href = `/dashboard/history/${session.sessionId}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={session.sessionId}
                    href={href}
                    title={!isOpen ? session.title : undefined}
                    className={`flex ${isOpen ? 'gap-3 px-4' : 'justify-center px-0'} items-center py-2.5 rounded-lg transition-colors w-full text-left ${
                      isActive ? 'bg-gray-200 text-[#003e93]' : 'hover:bg-gray-200'
                    }`}
                  >
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#003e93]' : 'text-gray-400'}`} />
                    {isOpen && <span className={`truncate text-sm font-medium leading-normal pb-[2px] ${isActive ? 'text-[#003e93]' : 'text-[#454652]'}`}>{session.title}</span>}
                  </Link>
                );
              })
            )}

            {!isLoading && showMoreButton && (
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
