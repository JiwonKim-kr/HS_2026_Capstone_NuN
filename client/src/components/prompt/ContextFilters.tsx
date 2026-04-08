"use client";

import { X, Sparkles } from "lucide-react";

interface ContextFiltersProps {
  contexts: string[];
  onRemove: (tag: string) => void;
}

export function ContextFilters({ contexts, onRemove }: ContextFiltersProps) {
  return (
    <div className="w-full flex justify-center mt-8">
      <div className="w-full max-w-[830px] grid grid-cols-3 gap-4">
        {/* Chips Container: takes 2 columns in the grid layout based on Figma Asymmetric layout */}
        <div className="bg-[#f2f4f6] col-span-2 rounded-[12px] p-6 flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <Sparkles className="w-3 h-3 text-[#2b3896]" />
            <h3 className="font-medium text-[#2b3896] text-[12px] tracking-[1.2px] uppercase">
              추가 컨텍스트
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {contexts.map((tag, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-[#eceef0] flex items-center px-3 py-1.5 rounded-[8px] shadow-sm"
              >
                <span className="font-medium text-[#454652] text-[12px]">
                  {tag}
                </span>
                <button 
                  onClick={() => onRemove(tag)}
                  className="ml-2 mt-0.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
