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

        {/* Right Side: Actions */}
        <div className="flex items-center gap-[16px]">
          <Link href="/login" className="flex items-center justify-center px-[16px] py-[8px]">
            <span className="text-[#454652] text-[16px] leading-[24px] hover:text-[#191c1e] transition-colors">
              로그인
            </span>
          </Link>
          <Link href="/onboarding" className="bg-[#003e93] flex flex-col items-center justify-center px-[24px] py-[8px] rounded-[8px] hover:bg-[#003682] transition-colors">
            <span className="text-[16px] text-white leading-[24px] text-center">
              시작하기
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
