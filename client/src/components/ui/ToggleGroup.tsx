interface ToggleGroupProps {
  options: { label: string; value: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export function ToggleGroup({ options, selectedValue, onChange }: ToggleGroupProps) {
  return (
    <div className="bg-[#f2f4f6] flex items-center justify-center p-[4px] rounded-[8px] w-full">
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex flex-1 flex-col items-center justify-center py-[8px] rounded-[6px] transition-all duration-200 ${
              isSelected
                ? 'bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
                : 'bg-transparent'
            }`}
          >
            <span
              className={`text-[14px] leading-[20px] ${
                isSelected ? 'text-[#003e93]' : 'text-[#454652]'
              }`}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
