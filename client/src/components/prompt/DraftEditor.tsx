"use client";

import { useState } from "react";
import { SendHorizonal } from "lucide-react";

interface DraftEditorProps {
  onSubmit?: (text: string) => void;
}

export function DraftEditor({ onSubmit }: DraftEditorProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim() && onSubmit) {
      onSubmit(text.trim());
    }
  };

  return (
    <div className="w-full flex-shrink-0 flex flex-col items-center">
      <div className="w-full max-w-[830px] flex flex-col h-[385px] relative">
        {/* Glow Background */}
        <div className="absolute inset-[-4px] bg-gradient-to-r from-[#2b3896] to-[#003e93] opacity-5 blur-[4px] rounded-[12px] z-0" />
        
        {/* Editor Container */}
        <div className="bg-white border flex flex-col h-full border-[#e6e8ea] rounded-[12px] shadow-sm relative z-10 overflow-hidden">
          {/* Label */}
          <div className="pt-6 px-6">
            <h2 className="font-semibold text-[#2b3896] text-[11px] tracking-[1.1px] uppercase">
              Draft Prompt
            </h2>
          </div>
          
          {/* Text Area */}
          <div className="flex-1 px-6 pb-6 pt-2">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-full resize-none bg-transparent text-[#191c1e] text-[20px] leading-[28px] placeholder:text-[#c5c5d4] outline-none"
              placeholder="여기에 거친 초안이나 아이디어를 입력하세요..."
            />
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-[#f2f4f6]/50 h-[80px] w-full flex items-center justify-end px-6 mt-auto shrink-0 relative">
            <button 
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="bg-[#003e93] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#002f6e] transition-colors rounded-[12px] flex items-center justify-center size-[48px] absolute -translate-y-1/2 top-1/2 right-[24px] shadow-md hover:shadow-lg group"
            >
              <SendHorizonal className="w-5 h-5 text-white ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
