"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, MessageSquare, ChevronDown, ChevronUp, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SessionData {
  sessionId: string;
  title: string;
  createdAt: string;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [history, setHistory] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletePopoverPos, setDeletePopoverPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/prompts/history`);
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

  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmId(sessionId);
    setDeletePopoverPos({ x: e.clientX, y: e.clientY });
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmId(null);
    setDeletePopoverPos(null);
  };

  const handleConfirmDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/prompts/history/${sessionId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setHistory(prev => prev.filter(s => s.sessionId !== sessionId));
        setDeleteConfirmId(null);
        setDeletePopoverPos(null);
        if (pathname === `/dashboard/history/${sessionId}`) {
          window.location.href = '/dashboard';
        }
      } else {
        alert(t("sidebar.delete_fail"));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(t("sidebar.delete_error"));
    }
  };

  return (
    <>
      {/* 모바일 backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* 사이드바 본체 — 너비만 트랜지션, 내부 레이아웃은 고정 */}
      <aside
        className={`
          bg-[#f2f4f6] flex flex-col h-full shrink-0 z-50
          fixed md:relative inset-y-0 left-0
          transition-[width] duration-300 ease-in-out
          overflow-hidden
          ${isMobileOpen ? 'translate-x-0 w-[256px]' : '-translate-x-full md:translate-x-0'}
          ${!isMobileOpen ? (isOpen ? 'md:w-[256px]' : 'md:w-[68px]') : ''}
          pt-[72px] md:pt-4
        `}
      >
        {/* 토글 버튼 영역 */}
        <div className="flex items-center h-[52px] px-4 shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex w-8 h-8 items-center justify-center hover:bg-gray-200 rounded-md transition-colors shrink-0"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* 새 채팅 버튼 — 아이콘 고정 위치, 텍스트만 페이드 */}
        <div className="px-3 pb-2 shrink-0">
          <a
            href="/dashboard"
            title={!isOpen ? t("sidebar.new_chat") : undefined}
            className="bg-white hover:bg-gray-50 transition-colors flex items-center gap-3 px-3 py-3 rounded-lg shadow-sm w-full border border-gray-100 overflow-hidden"
          >
            <Plus className="w-4 h-4 text-[#003e93] shrink-0" />
            <span
              className={`font-medium text-[#003e93] text-sm whitespace-nowrap transition-opacity duration-200 ${
                isOpen ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {t("sidebar.new_chat")}
            </span>
          </a>
        </div>

        {/* 히스토리 섹션 */}
        <div className="flex-grow overflow-y-auto px-3">
          {/* 섹션 헤더 */}
          <div
            className={`px-1 pt-3 pb-1 overflow-hidden transition-opacity duration-200 ${
              isOpen ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <h3 className="text-[#757684] text-[11px] font-medium tracking-wide whitespace-nowrap">
              {t("sidebar.history")}
            </h3>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            {isLoading ? (
              <div className={`px-1 py-2 text-sm text-gray-400 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                {t("sidebar.loading")}
              </div>
            ) : history.length === 0 ? (
              <div className={`px-1 py-2 text-sm text-gray-400 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                {t("sidebar.empty")}
              </div>
            ) : (
              visibleHistory.map((session) => {
                const href = `/dashboard/history/${session.sessionId}`;
                const isActive = pathname === href;
                return (
                  <div key={session.sessionId} className="relative w-full">
                    <Link
                      href={href}
                      title={!isOpen ? session.title : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left overflow-hidden ${
                        isActive ? 'bg-gray-200 text-[#003e93]' : 'hover:bg-gray-200'
                      }`}
                      onClick={onMobileClose}
                    >
                      <div className="relative w-4 h-4 shrink-0 flex items-center justify-center group">
                        <MessageSquare className={`w-4 h-4 absolute transition-opacity duration-200 ${isActive ? 'text-[#003e93]' : 'text-gray-400'} group-hover:opacity-0 ${deleteConfirmId === session.sessionId ? 'opacity-0' : ''}`} />
                        <button
                          onClick={(e) => handleDeleteClick(e, session.sessionId)}
                          className={`absolute transition-opacity duration-200 text-gray-400 hover:text-red-500 z-10 ${deleteConfirmId === session.sessionId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <span
                        className={`truncate text-sm font-medium leading-normal pb-[2px] whitespace-nowrap transition-opacity duration-200 ${
                          isActive ? 'text-[#003e93]' : 'text-[#454652]'
                        } ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                      >
                        {session.title}
                      </span>
                    </Link>

                    {deleteConfirmId === session.sessionId && deletePopoverPos && (
                      <div
                        className="fixed bg-white border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-md p-1 flex gap-1 z-[100]"
                        style={{
                          top: deletePopoverPos.y - 10,
                          left: deletePopoverPos.x + 10
                        }}
                      >
                        <button
                          onClick={(e) => handleConfirmDelete(e, session.sessionId)}
                          className="text-[11px] font-medium text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap"
                        >
                          {t("sidebar.delete")}
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="text-[11px] font-medium text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap"
                        >
                          {t("sidebar.cancel")}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {!isLoading && showMoreButton && (
              <button
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                title={!isOpen ? (isHistoryExpanded ? t("sidebar.collapse") : t("sidebar.expand")) : undefined}
                className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg hover:bg-gray-200 transition-colors w-full text-left overflow-hidden"
              >
                {isHistoryExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
                <span
                  className={`text-gray-500 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
                    isOpen ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {isHistoryExpanded ? t("sidebar.collapse") : t("sidebar.expand")}
                </span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
