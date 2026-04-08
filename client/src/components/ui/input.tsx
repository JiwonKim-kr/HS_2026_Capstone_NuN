import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  wrapperClassName?: string;
}

export function Input({
  label,
  wrapperClassName = "",
  className = "",
  ...props
}: InputProps) {
  return (
    <div className={`flex flex-col gap-[8.5px] ${wrapperClassName}`}>
      {label && (
        <label className="text-[#454652] text-[14px] leading-[20px]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={[
            "w-full h-[48px] bg-[#f2f4f6] rounded-[8px] px-[12px]",
            "text-[#191c1e] text-[16px] leading-normal font-normal",
            "placeholder:text-[#6b7280]",
            "focus:outline-none focus:ring-2 focus:ring-[#003e93]/30 focus:bg-white transition-colors",
            className,
          ].join(" ")}
          {...props}
        />
      </div>
    </div>
  );
}
