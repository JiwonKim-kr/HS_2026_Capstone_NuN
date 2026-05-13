"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNavBar } from "./TopNavBar";

export function MainLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-[#f8f9fb] flex h-screen w-full relative overflow-clip font-sans text-gray-900">
      <TopNavBar onMenuClick={() => setIsMobileMenuOpen(true)} />
      <div className="flex h-full w-full pt-[72px]">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />
        <main className="flex-1 relative h-full flex flex-col px-4 md:px-8 lg:px-16 overflow-y-auto w-full transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
