"use client";

import React, { useState } from "react";

interface ToggleOption {
  label: string;
  value: string;
}

interface ToggleGroupProps {
  label?: string;
  options: ToggleOption[];
  value?: string;
  onChange?: (value: string) => void;
  wrapperClassName?: string;
}

export function ToggleGroup({
  label,
  options,
  value: controlledValue,
  onChange,
  wrapperClassName = "",
}: ToggleGroupProps) {
  const [internalValue, setInternalValue] = useState(
    options[0]?.value ?? ""
  );

  const selected = controlledValue ?? internalValue;

  const handleSelect = (v: string) => {
    setInternalValue(v);
    onChange?.(v);
  };

  return (
    <div className={`flex flex-col gap-[8.5px] ${wrapperClassName}`}>
      {label && (
        <span className="text-[#454652] text-[14px] leading-[20px]">
          {label}
        </span>
      )}
      <div className="flex items-start p-[4px] bg-[#f2f4f6] rounded-[8px] w-full">
        {options.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={[
                "flex-1 py-[8px] rounded-[6px] text-[14px] text-center leading-[20px] transition-all duration-150 cursor-pointer",
                isActive
                  ? "bg-white text-[#003e93] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                  : "bg-transparent text-[#454652]",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
