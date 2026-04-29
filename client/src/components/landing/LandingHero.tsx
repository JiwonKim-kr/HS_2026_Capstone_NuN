export function LandingHero() {
  return (
    <section className="relative w-full flex justify-center pt-[128px] pb-[80px] px-[24px] overflow-hidden">
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-[48px] w-full max-w-[1280px] min-h-[573px] relative z-10">

        {/* Left Side: Copy */}
        <div className="flex flex-col justify-center gap-[32px] w-full self-center">
          <div className="w-full">
            <h1 className="flex flex-col tracking-[-1.8px] font-normal m-0">
              <div className="leading-[96px]">
                <span className="text-[#2b3896] text-[96px]">Prompt</span>
                <span className="text-[96px]">{` `}</span>
                <span className="text-[#003e93] text-[96px]">- U</span>
                <span className="text-[#2b3896] text-[72px]">,</span>
              </div>
              <div className="leading-[72px]">
                <span className="text-[#191c1e] text-[72px]">AI를 다루는</span>
              </div>
              <div className="leading-[72px]">
                <span className="text-[#191c1e] text-[72px]">당신만의 방식.</span>
              </div>
            </h1>
          </div>
          <div className="max-w-[512px] w-full">
            <p className="text-[#454652] text-[18px] leading-[29.25px]">
              업무 흐름에 맞춰 스스로 발전하는 AI를 경험해 보세요. Prompt-U는 사용자가 가진 특유의 대화 방식과 질문 패턴을 깊이 학습하여 언제나 필요한 결과물을 제공합니다.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="relative flex flex-col justify-center w-full self-center">
          {/* Background Blur Effect */}
          <div
            className="absolute inset-[-16px] rounded-[32px] blur-[20px] -z-10"
            style={{ backgroundImage: "linear-gradient(44.1143deg, rgba(43, 56, 150, 0.1) 0%, rgba(0, 62, 147, 0.1) 100%)" }}
          />

          <div className="bg-white flex flex-col items-start p-[40px] gap-[32px] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full relative">
            <div className="flex flex-col gap-[4px] w-full">
              <h2 className="text-[#191c1e] text-[24px] leading-[32px]">
                다시 오신 것을 환영합니다
              </h2>
              <p className="text-[#454652] text-[14px] leading-[20px]">
                Prompt-U 와 함께 여정을 계속하세요.
              </p>
            </div>

            <form className="flex flex-col gap-[24px] w-full">
              <div className="relative h-[76px] w-full">
                <label className="absolute left-[4px] top-[9.5px] -translate-y-1/2 text-[#454652] text-[14px] leading-[20px]">
                  이메일 주소
                </label>
                <div className="absolute top-[28px] bg-[#e0e3e5] px-[16px] py-[14px] rounded-[8px] w-full border-2 border-transparent focus-within:border-[#003e93] transition-colors">
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full bg-transparent outline-none border-none text-[16px] text-gray-900 placeholder:text-[rgba(117,118,132,0.5)]"
                  />
                </div>
              </div>

              <div className="relative h-[76px] w-full">
                <label className="absolute left-[4px] top-[9.5px] -translate-y-1/2 text-[#454652] text-[14px] leading-[20px]">
                  비밀번호
                </label>
                <div className="absolute top-[28px] bg-[#e0e3e5] px-[16px] py-[14px] rounded-[8px] w-full border-2 border-transparent focus-within:border-[#003e93] transition-colors">
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none border-none text-[16px] text-gray-900 placeholder:text-[rgba(117,118,132,0.5)]"
                  />
                </div>
              </div>

              <button type="button" className="bg-[#003e93] text-white text-[16px] font-bold leading-[24px] py-[16px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-[#003682] transition-colors font-['Manrope'] w-full">
                로그인
              </button>
            </form>

            <div className="border-t border-[#eceef0] pt-[33px] flex flex-col gap-[16px] w-full">
              <button type="button" className="bg-[#f2f4f6] flex items-center justify-center py-[12px] gap-[12px] rounded-[8px] hover:bg-[#e9ecef] transition-colors w-full">
                <span className="font-['Actor'] text-[24px] text-[#191c1e] leading-[24px]">google</span>
                <span className="font-medium text-[16px] text-[#191c1e] leading-[24px]">Google로 계속하기</span>
              </button>

              <div className="flex justify-center w-full">
                <p className="text-[#454652] text-[14px] leading-[20px] text-center">
                  계정이 없으신가요?{' '}
                  <a href="/signup" className="text-[#2b3896] hover:underline">무료로 시작하기</a>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
