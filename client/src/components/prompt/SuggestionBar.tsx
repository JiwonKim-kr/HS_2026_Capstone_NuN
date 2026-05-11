"use client";

interface SuggestionBarProps {
  suggestions: string[];
  onAdd: (tag: string) => void;
}

export function SuggestionBar({ suggestions, onAdd }: SuggestionBarProps) {
  return (
    <div className="w-full flex justify-center pt-8">
      <div className="flex gap-3 items-center min-h-[36px]">
        <span className="text-[#c5c5d4] text-[12px] font-medium mr-1 tracking-wide">
          제안:
        </span>
        {suggestions.map((suggestion, idx) => (
          <button 
            key={idx}
            onClick={() => onAdd(suggestion)}
            className="bg-[#d9e2ff] border border-[#b0c6ff] hover:bg-[#c5d3fa] transition-colors rounded-full px-4 py-2 text-[#001945] text-[12px] font-medium text-center shadow-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
