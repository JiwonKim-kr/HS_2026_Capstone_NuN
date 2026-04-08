import Image from "next/image";

interface StepNavigationProps {
  currentStep: number;
}

export function StepNavigation({ currentStep }: StepNavigationProps) {
  return (
    <div className="flex flex-col gap-[16px] w-full">
      {/* Step 1 */}
      <div className={`flex gap-[16px] items-center w-full ${currentStep === 1 ? '' : 'opacity-40'}`}>
        {currentStep === 1 ? (
          <div className="bg-[#003e93] flex items-center justify-center rounded-full size-[32px]">
            <span className="font-semibold text-[12px] text-white">1</span>
          </div>
        ) : (
          <div className="relative size-[32px]">
            <Image src="/icons/check.svg" alt="Done" width={32} height={32} />
          </div>
        )}
        <div className="flex flex-col justify-center h-[20px]">
          <span className={`text-[14px] leading-[20px] ${currentStep === 1 ? 'text-[#191c1e]' : 'text-[#454652]'}`}>
            기본 인적사항
          </span>
        </div>
      </div>

      {/* Step 2 */}
      <div className={`flex gap-[16px] items-center w-full ${currentStep === 2 ? '' : 'opacity-40'}`}>
        {currentStep === 2 ? (
          <div className="bg-[#003e93] flex items-center justify-center rounded-full size-[32px]">
            <span className="font-semibold text-[12px] text-white">2</span>
          </div>
        ) : (
          <div className="bg-[#e0e3e5] flex items-center justify-center rounded-full size-[32px]">
            <span className="font-semibold text-[12px] text-[#454652]">2</span>
          </div>
        )}
        <div className="flex flex-col justify-center h-[20px]">
          <span className={`text-[14px] leading-[20px] ${currentStep === 2 ? 'text-[#191c1e]' : 'text-[#454652]'}`}>
            주요 활용 목적
          </span>
        </div>
      </div>
    </div>
  );
}
