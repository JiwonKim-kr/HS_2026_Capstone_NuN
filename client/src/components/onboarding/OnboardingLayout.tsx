import { ReactNode } from "react";
import { StepNavigation } from "./StepNavigation";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
}

export function OnboardingLayout({ children, currentStep }: OnboardingLayoutProps) {
  // Title text depends on step
  const title = currentStep === 1 
    ? "나만의 AI 프롬프터를\n만들어보세요." 
    : "나만의 AI 선호 모델을\n만들어보세요.";

  const headerText = `2단계 중 ${currentStep}단계`;
  
  // Calculate width percentage based on step
  const progressWidth = currentStep === 1 ? 25 : 75; // Step 1: 25%, Step 2: 75%  (Design showed 25% for both, but fixing it to be dynamic)

  return (
    <div className="bg-[#f8f9fb] flex flex-col items-center relative size-full min-h-screen text-gray-900 font-sans">
      
      {/* Top Header */}
      <div className="fixed top-0 left-0 w-full z-10">
        <div className="bg-[#f2f4f6] h-[4px] w-full w-full relative overflow-hidden">
          <div 
            className="absolute bg-[#003e93] h-full left-0 top-0 transition-all duration-300 ease-in-out" 
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <div className="backdrop-blur-[12px] bg-[rgba(248,249,251,0.8)] flex items-center justify-between px-[24px] py-[16px] w-full">
          <span className="font-bold text-[#191c1e] text-[20px] tracking-[-1px] leading-[28px]">
            Prompt-U
          </span>
          <span className="text-[#757684] text-[12px] tracking-[1.2px] uppercase leading-[16px]">
            {headerText}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col items-center justify-center w-full min-h-screen pb-[134px] pt-[182px] px-[16px]">
        
        {/* Container for Aside & Form */}
        <div className="grid grid-cols-12 gap-[32px] w-full max-w-[896px]">
          
          {/* Aside (Left) */}
          <div className="col-span-4 flex flex-col items-start pt-[32px]">
            <div className="flex flex-col gap-[32px] w-full">
              <div className="flex flex-col gap-[14.75px] w-full">
                <h1 className="text-[#191c1e] text-[30px] tracking-[-0.75px] leading-[37.5px] whitespace-pre-wrap">
                  {title}
                </h1>
                <p className="text-[#454652] text-[14px] leading-[22.75px]">
                  사용자 경험을 맞춤화하세요. 이 데이터는 사용자의 전문 분야에 맞춰 Prompt-U를 튜닝하는 데 사용됩니다.
                </p>
              </div>
              <StepNavigation currentStep={currentStep} />
            </div>
          </div>

          {/* Form Content (Right) */}
          <div className="col-span-8">
            <div className="bg-white flex flex-col items-start pb-[48px] pt-[32px] px-[32px] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full min-h-[562px]">
              {children}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
