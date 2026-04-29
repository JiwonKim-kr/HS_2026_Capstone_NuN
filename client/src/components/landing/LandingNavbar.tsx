import Link from "next/link";

export function LandingNavbar() {
  return (
    <div className="absolute top-0 left-0 w-full flex justify-center z-50">
      <div className="w-full max-w-[1280px] backdrop-blur-[12px] bg-[rgba(248,249,251,0.8)] flex items-center justify-between px-[24px] py-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-[32px]">
          <div className="flex flex-col justify-center h-[28px]">
            <Link href="/" className="font-bold text-[#191c1e] text-[20px] tracking-[-1px] leading-[28px]">
              Prompt-U
            </Link>
          </div>
        </div>


      </div>
    </div>
  );
}
