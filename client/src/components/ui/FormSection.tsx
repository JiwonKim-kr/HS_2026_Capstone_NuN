import { ReactNode } from "react";

interface FormSectionProps {
  label: string;
  heading?: string;
  children: ReactNode;
}

export function FormSection({ label, heading, children }: FormSectionProps) {
  return (
    <div className="flex flex-col gap-[24px] w-full">
      <div className="flex flex-col gap-[8px] w-full">
        {label && (
          <span className="text-[#757684] text-[12px] tracking-[0.6px] uppercase leading-[16px]">
            {label}
          </span>
        )}
        {heading && (
          <h2 className="text-[#191c1e] text-[20px] leading-[28px]">
            {heading}
          </h2>
        )}
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
