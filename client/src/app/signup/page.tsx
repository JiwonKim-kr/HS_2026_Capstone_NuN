"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { phone },
      },
    });

    if (error) {
      setError(error.message === "User already registered"
        ? "이미 가입된 이메일입니다. 로그인 페이지로 이동해 주세요."
        : error.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
  };


  return (
    <div className="relative min-h-screen w-full bg-[#f8f9fb] flex flex-col">
      {/* 상단 프로그레스 바 */}
      <div className="absolute top-0 left-0 w-full h-[4px] bg-[#f2f4f6] overflow-hidden z-20">
        <div className="absolute top-0 left-0 h-full w-1/4 bg-[#003e93]" />
      </div>

      {/* 헤더 */}
      <header className="absolute top-0 left-0 w-full z-10 flex items-center justify-between px-6 py-4 backdrop-blur-[12px] bg-[rgba(248,249,251,0.8)]">
        <Link href="/" className="font-manrope font-bold text-[20px] leading-[28px] tracking-[-1px] text-[#191c1e]">
          Prompt-U
        </Link>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex flex-1 items-center justify-center px-4 pt-[182px] pb-[134px]">
        <div className="w-full max-w-[448px] flex flex-col gap-[39.5px]">

          {/* 헤더 텍스트 */}
          <div className="flex flex-col gap-3 w-full">
            <h1 className="text-[36px] leading-[40px] tracking-[-0.9px] text-[#191c1e] font-normal">
              계정 만들기
            </h1>
            <p className="text-[16px] leading-[26px] text-[#454652] font-normal">
              Prompt-U와 함께 당신만의 프롬프팅을 시작하세요.
            </p>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">

            {/* 에러 메시지 */}
            {error && (
              <div className="w-full rounded-[8px] bg-[#fff1f1] border border-[#ffb3b3] px-4 py-3 text-[14px] text-[#ba1a1a] leading-[20px]">
                {error}
              </div>
            )}

            {/* 이메일 필드 */}
            <div className="flex flex-col gap-2 w-full">
              <label
                htmlFor="email"
                className="text-[14px] leading-[20px] font-semibold text-[#454652]"
              >
                이메일 주소 (아이디)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full h-[48px] bg-[#e0e3e5] rounded-[8px] px-4 py-[14px] text-[16px] leading-normal text-[#191c1e] font-normal placeholder:text-[rgba(117,118,132,0.6)] focus:outline-none focus:ring-2 focus:ring-[#003e93]/40 focus:bg-white transition-colors duration-150"
              />
            </div>

            {/* 비밀번호 필드 */}
            <div className="flex flex-col gap-2 w-full">
              <label
                htmlFor="password"
                className="text-[14px] leading-[20px] font-normal text-[#454652]"
              >
                비밀번호
              </label>
              <div className="relative w-full">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8자 이상의 영문, 숫자, 특수문자 조합"
                  autoComplete="new-password"
                  className="w-full h-[48px] bg-[#e0e3e5] rounded-[8px] px-4 py-[14px] pr-[44px] text-[16px] leading-normal text-[#191c1e] font-normal placeholder:text-[rgba(117,118,132,0.6)] focus:outline-none focus:ring-2 focus:ring-[#003e93]/40 focus:bg-white transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#454652] transition-colors"
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showPassword ? (
                    // eye-off icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // eye icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 전화번호 필드 */}
            <div className="flex flex-col gap-2 pb-4 w-full">
              <label
                htmlFor="phone"
                className="text-[14px] leading-[20px] font-normal text-[#454652]"
              >
                전화번호
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                autoComplete="tel"
                className="w-full h-[48px] bg-[#e0e3e5] rounded-[8px] px-4 py-[14px] text-[16px] leading-normal text-[#191c1e] font-normal placeholder:text-[rgba(117,118,132,0.6)] focus:outline-none focus:ring-2 focus:ring-[#003e93]/40 focus:bg-white transition-colors duration-150"
              />
            </div>

            {/* 회원가입 완료 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[56px] bg-[#3f51b5] hover:bg-[#3949a3] active:bg-[#303f9f] disabled:opacity-60 disabled:cursor-not-allowed rounded-[8px] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center text-white text-[18px] leading-[28px] font-normal transition-colors duration-150 cursor-pointer"
            >
              {loading ? "가입 처리 중..." : "회원가입 완료"}
            </button>

            {/* 소셜 로그인 구분선 */}
            <div className="relative flex items-center justify-center py-4 w-full">
              <div className="absolute inset-x-0 top-1/2 border-t border-[rgba(197,197,212,0.3)]" />
              <span className="relative bg-[#f8f9fb] px-2 text-[12px] leading-[16px] uppercase text-[#757684]">
                또는 소셜 계정으로 시작
              </span>
            </div>

            {/* Google 소셜 버튼 (추후 구현 예정 — 현재 비활성) */}
            <button
              type="button"
              disabled
              title="추후 지원 예정"
              className="w-full h-[48px] border border-[#c5c5d4] rounded-[8px]
                         flex items-center justify-center gap-2
                         opacity-50 cursor-not-allowed
                         transition-colors duration-150"
            >
              {/* Google 아이콘 (SVG inline) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 21 21"
                width="21"
                height="21"
                aria-hidden="true"
              >
                <path
                  d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.908 8.908 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"
                  fill="#4285F4"
                />
                <path
                  d="M1.31 6.734l3.053 2.237A5.267 5.267 0 0 1 9.433 5.51c1.259 0 2.397.447 3.29 1.178l2.6-2.599C13.74 2.708 11.709 1.856 9.434 1.856c-3.617 0-6.73 2.028-8.124 4.878z"
                  fill="#FF3D00"
                />
                <path
                  d="M9.433 18.062c2.215 0 4.214-.77 5.786-2.035l-2.775-2.35a5.241 5.241 0 0 1-3.011.943 5.271 5.271 0 0 1-4.983-3.591l-3.016 2.323c1.395 2.893 4.431 4.71 7.999 4.71z"
                  fill="#4CAF50"
                />
                <path
                  d="M20.283 10.356h-8.327v3.451h4.792c-.211 1.062-.857 1.988-1.765 2.584l2.775 2.35c1.665-1.538 2.525-3.817 2.525-6.385 0-.528-.081-1.097-.202-1.625.024.009.202.025.202.025z"
                  fill="#1565C0"
                />
              </svg>
              <span className="text-[14px] leading-[20px] font-semibold text-[#191c1e]">
                Google 계정으로 시작하기
              </span>
            </button>

            {/* 로그인 링크 */}
            <p className="text-center text-[14px] leading-[20px] text-[#757684]">
              이미 계정이 있으신가요?{" "}
              <Link href="/" className="text-[#3f51b5] font-semibold hover:underline">
                로그인
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
