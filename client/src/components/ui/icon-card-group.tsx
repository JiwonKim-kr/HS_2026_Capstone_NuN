"use client";

import React from "react";

interface IconCardOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface IconCardGroupProps {
  options: IconCardOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /** 복수 선택 허용 여부 (기본: true) */
  multiple?: boolean;
  /** 한 줄에 몇 개씩 그리드 (기본: 3) */
  cols?: 2 | 3;
}

export function IconCardGroup({
  options,
  selected,
  onChange,
  multiple = true,
  cols = 3,
}: IconCardGroupProps) {
  const toggle = (value: string) => {
    if (multiple) {
      if (selected.includes(value)) {
        onChange(selected.filter((v) => v !== value));
      } else {
        onChange([...selected, value]);
      }
    } else {
      onChange(selected.includes(value) ? [] : [value]);
    }
  };

  const colClass = cols === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className={`grid ${colClass} gap-[12px] w-full`}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={[
              "flex flex-col items-center gap-[8px] p-[18px] rounded-[12px] border-2 cursor-pointer transition-all duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003e93]/50",
              isSelected
                ? "bg-white border-[#003e93] shadow-[0px_1px_4px_rgba(0,62,147,0.12)]"
                : "bg-[#f2f4f6] border-transparent hover:bg-[#e8eaed]",
            ].join(" ")}
          >
            <span className="flex items-center justify-center size-[22px] text-[#191c1e]">
              {opt.icon}
            </span>
            <span
              className={[
                "text-[12px] leading-[16px] text-center whitespace-nowrap",
                isSelected ? "text-[#003e93] font-medium" : "text-[#191c1e]",
              ].join(" ")}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
