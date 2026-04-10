import Image from "next/image";
import Link from "next/link";

export function LandingFeatures() {
  return (
    <section className="w-full bg-[#f2f4f6] flex justify-center py-[96px] px-[24px]">
      <div className="flex gap-[64px] items-start w-full max-w-[1280px]">
        
        {/* Left Info Section */}
        <div className="flex flex-col gap-[24px] w-[389.33px] flex-shrink-0">
          <div className="w-full">
            <h2 className="text-[#191c1e] text-[36px] tracking-[-0.9px] leading-[40px] m-0">
              내 스타일을 읽는 <span className="text-[#003e93]">AI,</span>
              <br />
              프롬프팅 <span className="text-[#003e93]">어드바이저</span>
            </h2>
          </div>
          <div className="w-full">
            <p className="text-[#454652] text-[16px] leading-[26px]">
              원하는 답변을 얻기 위해 매번 긴 배경 설명과 제약 조건을 고민하셨나요? Prompt-U는 당신의 직무와 목적, 선호하는 어투를 분석합니다. 대충 적은 초안도 당신의 의도에 꼭 맞는 전문가 수준의 프롬프트로 자동 설계해 드립니다.
            </p>
          </div>
          <div className="flex flex-col gap-[16px] w-full pt-[16px]">
            <div className="flex items-center gap-[12px]">
              <div className="bg-[#e0e3e5] rounded-[8px] size-[40px] flex items-center justify-center flex-shrink-0">
                <div className="relative w-[19px] h-[20px]">
                  <Image src="/icons/landing/learning.svg" alt="Learning" fill className="object-contain" />
                </div>
              </div>
              <span className="text-[#191c1e] text-[16px] leading-[24px]">지속적인 피드백 학습</span>
            </div>
            <div className="flex items-center gap-[12px]">
              <div className="bg-[#e0e3e5] rounded-[8px] size-[40px] flex items-center justify-center flex-shrink-0">
                <div className="relative size-[24px]">
                  <Image src="/icons/landing/target_fill.svg" alt="Target" fill className="object-contain" />
                </div>
              </div>
              <span className="text-[#191c1e] text-[16px] leading-[24px]">맞춤형 스타일 가중치</span>
            </div>
          </div>
        </div>

        {/* Right Bento Grid */}
        <div className="grid grid-cols-2 grid-rows-[240.25px_263px] gap-[32px] w-full min-w-[778.67px]">
          
          {/* Bento 1: 프롬프트 재구성 */}
          <div className="bg-white rounded-[12px] p-[32px] flex flex-col gap-[24px]">
            <div className="bg-[#d9e2ff] rounded-[8px] size-[48px] flex items-center justify-center">
              <div className="relative size-[18px]">
                <Image src="/icons/landing/bento_1.svg" alt="Reconstruct" fill className="object-contain" />
              </div>
            </div>
            <div className="flex flex-col gap-[6.75px]">
              <h3 className="text-[#191c1e] text-[20px] leading-[28px]">프롬프트 재구성</h3>
              <p className="text-[#454652] text-[14px] leading-[22.75px]">
                거친 생각과 초안도 시스템을 거치면 가장 최적화된 프롬프트로 변환됩니다. AI가 완벽하게 이해할 수 있는 구조로 다듬어 최종 결과물의 퀄리티를 극대화하세요.
              </p>
            </div>
          </div>

          {/* Bento 2: 피드백 루프 */}
          <div className="bg-white rounded-[12px] p-[32px] flex flex-col gap-[24px]">
            <div className="bg-[#dfe0ff] rounded-[8px] size-[48px] flex items-center justify-center">
              <div className="relative size-[18px]">
                <Image src="/icons/landing/bento_2.svg" alt="Feedback Loop" fill className="object-contain" />
              </div>
            </div>
            <div className="flex flex-col gap-[6.75px]">
              <h3 className="text-[#191c1e] text-[20px] leading-[28px]">피드백 루프</h3>
              <p className="text-[#454652] text-[14px] leading-[22.75px]">
                제시된 프롬프트 중 가장 마음에 드는 결과를 선택하기만 하면 됩니다. 당신의 선택이 시스템에 실시간으로 반영되어 쓸수록 온전히 나에게 맞춰진 AI로 진화합니다.
              </p>
            </div>
          </div>

          {/* Bento 3: 시간 단축 */}
          <div className="bg-white rounded-[12px] p-[32px] flex flex-col gap-[24px]">
            <div className="bg-[#e0e3e5] rounded-[8px] size-[48px] flex items-center justify-center">
              <div className="relative size-[24px]">
                <Image src="/icons/landing/bento_clock.svg" alt="Clock" fill className="object-contain" />
              </div>
            </div>
            <div className="flex flex-col gap-[7.125px]">
              <h3 className="text-[#191c1e] text-[20px] leading-[28px]">시간 단축</h3>
              <p className="text-[#454652] text-[14px] leading-[22.75px]">
                똑같은 맥락을 매번 AI에게 다시 설명할 필요가 없습니다. 최적화된 프롬프트가 당신의 소중한 시간을 획기적으로 단축해 줍니다.
              </p>
            </div>
          </div>

          {/* Bento 4: 액션 카드 */}
          <div className="bg-[#2b3896] rounded-[12px] py-[32px] px-[32px] flex flex-col items-start overflow-hidden">
             <div className="flex flex-col gap-[6.8px] w-full">
              <h3 className="text-white text-[20px] leading-[28px]">준비가 되셨나요?</h3>
              <div className="opacity-90 pb-[17.2px]">
                <p className="text-white text-[14px] leading-[22.75px]">
                  AI 사용 중 시행착오를 겪지 않아도 됩니다.<br/>
                  클릭 몇 번으로 업무 효율을 극대화하세요.
                </p>
              </div>
              <Link 
                href="/onboarding"
                className="bg-white hover:bg-gray-100 transition-colors rounded-[8px] px-[16px] py-[8px] flex items-center justify-center"
              >
                <span className="text-[#2b3896] text-[14px] leading-[20px]">맞춤형 프롬프트 만들기</span>
              </Link>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
