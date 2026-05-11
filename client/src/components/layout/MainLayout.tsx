import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNavBar } from "./TopNavBar";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#f8f9fb] flex h-screen w-full relative overflow-clip font-sans text-gray-900">
      <TopNavBar />
      <div className="flex h-full w-full pt-[72px]">
        <Sidebar />
        <main className="flex-1 relative h-full flex flex-col px-8 lg:px-16 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
