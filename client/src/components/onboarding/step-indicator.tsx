import React from "react";
import { Check } from "lucide-react";

export interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav className="flex flex-col gap-[16px] w-full">
      {steps.map((step) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isFuture = step.number > currentStep;

        return (
          <div
            key={step.number}
            className={`flex items-center gap-[16px] w-full transition-opacity duration-200 ${
              isFuture ? "opacity-40" : "opacity-100"
            }`}
          >
            {/* Step badge */}
            <div
              className={[
                "size-[32px] rounded-full flex items-center justify-center shrink-0",
                isActive || isCompleted ? "bg-[#003e93]" : "bg-[#e0e3e5]",
              ].join(" ")}
            >
              {isCompleted ? (
                <Check size={14} className="text-white" strokeWidth={2.5} />
              ) : (
                <span
                  className={[
                    "text-[12px] font-semibold leading-[16px]",
                    isActive ? "text-white" : "text-[#454652]",
                  ].join(" ")}
                >
                  {step.number}
                </span>
              )}
            </div>

            {/* Step label */}
            <span
              className={[
                "text-[14px] leading-[20px]",
                isActive ? "text-[#191c1e]" : "text-[#454652]",
              ].join(" ")}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
