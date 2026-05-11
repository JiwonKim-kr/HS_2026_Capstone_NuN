"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function LandingHero() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

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
              {error && (
                <div className="mt-[8px] w-full rounded-[8px] bg-[#fff1f1] border border-[#ffb3b3] px-4 py-3 text-[14px] text-[#ba1a1a] leading-[20px]">
                  {error}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-[24px] w-full">
              <div className="relative h-[76px] w-full">
                <label className="absolute left-[4px] top-[9.5px] -translate-y-1/2 text-[#454652] text-[14px] leading-[20px]">
                  이메일 주소
                </label>
                <div className="absolute top-[28px] bg-[#e0e3e5] px-[16px] py-[14px] rounded-[8px] w-full border-2 border-transparent focus-within:border-[#003e93] transition-colors">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    required
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full bg-transparent outline-none border-none text-[16px] text-gray-900 placeholder:text-[rgba(117,118,132,0.5)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#003e93] text-white text-[16px] font-bold leading-[24px] py-[16px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-[#003682] disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-['Manrope'] w-full"
              >
                {loading ? "로그인 중..." : "로그인"}
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
