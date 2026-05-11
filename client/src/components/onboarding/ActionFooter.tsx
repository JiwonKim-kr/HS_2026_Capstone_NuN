import Image from "next/image";

interface ActionFooterProps {
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
}

export function ActionFooter({ onNext, onSkip, nextLabel = "계속하기" }: ActionFooterProps) {
  return (
    <div className="flex items-center justify-between w-full pt-[24px] relative border-t border-t-transparent">
      {/* We use flex layout to place buttons. The continues button is centrally aligned or explicitly offset in Figma but let's make it standard right/left or centered.
          In the Figma context, "계속하기" was generally centered or rightward.
          Wait, looking at Figma: "계속하기" is at left-[377.33px] within an 896px container? It's roughly in the center.
          Let's place them neatly. Since the form width is grid-based, let's just center "계속하기" and put "건너뛰기" on the right if it exists. 
      */}
      <div className="flex-1" /> {/* Spacer */}
      
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onNext}
          className="bg-[#003e93] flex gap-[8px] items-center px-[32px] py-[12px] rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[#003682] transition-colors"
        >
          <span className="text-[16px] text-white leading-[24px]">
            {nextLabel}
          </span>
          <div className="relative size-[9.3px]">
            <Image src="/icons/arrow-right.svg" alt="Arrow Right" fill className="object-contain brightness-0 invert" />
          </div>
        </button>
      </div>

      <div className="flex-1 flex justify-end">
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center justify-center px-[16px]"
          >
            <span className="text-[14px] text-[#757684] leading-[20px] hover:text-[#454652] transition-colors">
              건너뛰기
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
