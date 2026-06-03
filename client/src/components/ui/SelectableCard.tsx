import Image from "next/image";

interface SelectableCardProps {
  label: string;
  iconSrc?: string;
  iconNode?: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  height?: string;
}

export function SelectableCard({ label, iconSrc, iconNode, isSelected, onClick, height = "84px" }: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ minHeight: height }}
      className={`flex flex-col items-center justify-center gap-[6px] px-[12px] py-[14px] rounded-[12px] border-2 transition-all duration-200 w-full ${
        isSelected
          ? 'bg-white border-[#003e93] shadow-[0px_1px_4px_0px_rgba(0,62,147,0.1)]'
          : 'bg-[#f2f4f6] border-[rgba(0,0,0,0)] hover:bg-[#e9ecef]'
      }`}
    >
      {/* 아이콘 — 고정 크기, 절대 축소되지 않음 */}
      <div className="relative flex-shrink-0 flex items-center justify-center size-[24px]">
        {iconSrc ? (
          <Image src={iconSrc} alt={label} fill className="object-contain" />
        ) : (
          iconNode
        )}
      </div>
      {/* 텍스트 — 여러 줄 허용, 중앙 정렬 */}
      <span className={`text-[11px] leading-[15px] text-center break-words w-full ${isSelected ? 'text-[#003e93] font-medium' : 'text-[#191c1e]'}`}>
        {label}
      </span>
    </button>
  );
}
