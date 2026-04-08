"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  wrapperClassName?: string;
}

export function Select({
  label,
  options,
  value: controlledValue,
  placeholder = "선택하세요",
  onChange,
  wrapperClassName = "",
}: SelectProps) {
  const [internalValue, setInternalValue] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = controlledValue ?? internalValue;
  const selectedLabel =
    options.find((o) => o.value === selected)?.label ?? "";

  const handleSelect = (v: string) => {
    setInternalValue(v);
    onChange?.(v);
    setOpen(false);
  };

  // Click-outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={`flex flex-col gap-[8.5px] ${wrapperClassName}`} ref={ref}>
      {label && (
        <span className="text-[#454652] text-[14px] leading-[20px]">
          {label}
        </span>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={[
            "w-full h-[48px] bg-[#f2f4f6] rounded-[8px] px-[16px]",
            "flex items-center justify-between",
            "text-[16px] leading-[24px] text-left cursor-pointer",
            selected ? "text-[#191c1e]" : "text-[#191c1e]",
            "focus:outline-none focus:ring-2 focus:ring-[#003e93]/30 transition-colors",
          ].join(" ")}
        >
          <span>{selectedLabel || placeholder}</span>
          <ChevronDown
            size={20}
            className={`text-[#454652] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <ul className="absolute z-50 top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#e0e3e5] rounded-[8px] shadow-[0px_4px_12px_rgba(0,0,0,0.08)] overflow-hidden">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={[
                    "w-full px-[16px] py-[12px] text-left text-[14px] leading-[20px] cursor-pointer transition-colors",
                    selected === opt.value
                      ? "text-[#003e93] bg-[#eef3fc]"
                      : "text-[#191c1e] hover:bg-[#f2f4f6]",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
