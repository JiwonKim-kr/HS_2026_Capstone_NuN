"use client";

import { use, useState } from "react";
import { Edit2, ChevronLeft, ChevronRight } from "lucide-react";

// ─── 더미 데이터 ──────────────────────────────────────────────
type HistoryItem = {
  title: string;
  date: string;
  originalPrompt: string;
  versions: { id: string; title: string; description: string }[];
};

const MOCK_HISTORY_DATA: Record<string, HistoryItem> = {
  "0": {
    title: "E-commerce Product Landing Page",
    date: "2026.04.28",
    originalPrompt:
      "이커머스 제품 랜딩 페이지를 위한 마케팅 카피를 작성해줘. 전환율을 높이는 방향으로.",
    versions: [
      {
        id: "01",
        title: "직설적이고 전문적으로",
        description:
          '"시니어 카피라이터로서 행동하세요. 전환율 최적화(CRO)에 초점을 맞춘 이커머스 제품 랜딩 페이지용 마케팅 카피를 작성하세요. 히어로 섹션, 핵심 혜택 3가지, 사회적 증거, CTA 버튼 텍스트를 포함하세요. 스캐너블하고 행동 유도적인 언어를 사용하세요."',
      },
      {
        id: "02",
        title: "창의적이고 감성적으로",
        description:
          '"브랜드 스토리텔러로서 이커머스 랜딩 페이지를 위한 감성적인 카피를 작성하세요. 고객의 페인 포인트에서 시작하여 제품이 어떻게 삶을 변화시키는지 서술하세요. 스토리 아크 구조(문제 → 해결 → 변화)를 따르고, 신뢰를 구축하는 사회적 증거와 긴급성을 유발하는 CTA를 포함하세요."',
      },
      {
        id: "03",
        title: "간결하고 데이터 중심으로",
        description:
          '"데이터 기반 마케터로서 이커머스 랜딩 페이지 카피를 작성하세요. 수치와 퍼센트를 활용하여 신뢰도를 높이고, A/B 테스트에 적합한 두 가지 헤드라인 변형을 제시하세요. 모바일 우선 스캔 패턴을 고려하여 간결하게 작성하세요."',
      },
    ],
  },
  "1": {
    title: "Python Script Optimization Request",
    date: "2026.04.27",
    originalPrompt: "내 파이썬 코드가 너무 느린데 최적화 방법을 알려줘.",
    versions: [
      {
        id: "01",
        title: "성능 프로파일링 중심으로",
        description:
          '"시니어 파이썬 엔지니어로서 행동하세요. cProfile, line_profiler를 활용한 병목 식별, 알고리즘 복잡도 분석, NumPy/Pandas 벡터화를 통한 개선 방법을 구체적인 코드 예시와 함께 단계별로 제시하세요."',
      },
      {
        id: "02",
        title: "실용적인 빠른 해결책으로",
        description:
          '"파이썬 최적화 전문가로서 성능 향상을 위한 Top 5 기법을 알려주세요: 리스트 컴프리헨션 vs 루프, 내장 함수 활용, 제너레이터 사용, 적절한 자료구조 선택, 멀티프로세싱 활용법. 각 기법에 Before/After 코드 예시를 포함하세요."',
      },
      {
        id: "03",
        title: "아키텍처 개선 관점으로",
        description:
          '"소프트웨어 아키텍트로서 비동기 프로그래밍(asyncio), 캐싱 전략(functools.lru_cache), 데이터베이스 쿼리 최적화, Cython/C 확장을 통한 크리티컬 패스 최적화를 포함한 종합적인 개선 로드맵을 작성하세요."',
      },
    ],
  },
  "2": {
    title: "LinkedIn Thought Leadership Post",
    date: "2026.04.25",
    originalPrompt:
      "링크드인에 올릴 생각 리더십 포스트를 작성해줘. 내 분야에서 인사이트 있어 보이게.",
    versions: [
      {
        id: "01",
        title: "개인 경험 기반 스토리텔링",
        description:
          '"링크드인 인플루언서로서 나의 실제 경험을 기반으로 한 생각 리더십 포스트를 작성하세요. 훅 → 개인 스토리 → 핵심 인사이트 3가지 → 실행 가능한 조언 → 커뮤니티 질문 구조를 따르세요. 진정성 있고 공감을 유발하는 톤으로 작성하고, 적절한 이모지와 해시태그를 포함하세요."',
      },
      {
        id: "02",
        title: "산업 트렌드 분석 관점",
        description:
          '"산업 분석가로서 현재 트렌드에 기반한 링크드인 생각 리더십 포스트를 작성하세요. 데이터 포인트나 최신 연구를 인용하여 신뢰도를 높이고, 반직관적인 인사이트를 포함하여 독자의 기존 생각에 도전하세요. 800자 이내로 작성하고 대화를 유도하는 질문으로 마무리하세요."',
      },
      {
        id: "03",
        title: "실용적 조언 리스트 형식",
        description:
          '"커리어 코치로서 즉시 적용 가능한 실용적 조언을 담은 링크드인 포스트를 작성하세요. 대부분의 [직군]이 모르는 [숫자]가지 방법 형식의 훅으로 시작하고, 각 포인트를 간결하게 설명하세요. 독자가 저장하고 공유하고 싶어지는 실용적인 가치를 제공하세요."',
      },
    ],
  },
  "3": {
    title: "Brainstorming Session for Marketing",
    date: "2026.04.23",
    originalPrompt: "마케팅 캠페인 아이디어 브레인스토밍 좀 도와줘.",
    versions: [
      {
        id: "01",
        title: "창의적 발산 중심으로",
        description:
          '"크리에이티브 디렉터로서 제약 없는 브레인스토밍 세션을 진행하세요. SCAMPER 기법(대체, 결합, 적응, 수정, 다른 용도, 제거, 역전)을 활용하여 기존 마케팅 캠페인의 경계를 넘어선 20가지 혁신적인 아이디어를 생성하세요. 실현 가능성보다 창의성에 집중하세요."',
      },
      {
        id: "02",
        title: "데이터 기반 전략적 접근",
        description:
          '"마케팅 전략가로서 타겟 오디언스 분석을 기반으로 한 캠페인 아이디어를 제시하세요. 각 아이디어에 대해 타겟 세그먼트, 핵심 메시지, 채널 믹스, 예상 KPI를 포함한 미니 브리프를 작성하세요. ROI 관점에서 우선순위가 높은 아이디어 순으로 정렬하세요."',
      },
      {
        id: "03",
        title: "경쟁사 차별화 관점으로",
        description:
          '"시장 포지셔닝 전문가로서 경쟁사 대비 차별화된 마케팅 캠페인 아이디어를 도출하세요. 업계 일반적인 캠페인 패턴을 나열하고, 각 패턴의 반대 방향으로 사고하여 독창적인 접근법을 찾으세요. 아무도 하지 않는 것에서 시작하는 Blue Ocean 마케팅 전략을 제안하세요."',
      },
    ],
  },
  "4": {
    title: "Code Refactoring Analysis",
    date: "2026.04.20",
    originalPrompt: "레거시 코드 리팩토링해야 하는데 어떻게 접근해야 할지 모르겠어.",
    versions: [
      {
        id: "01",
        title: "단계적 리팩토링 로드맵",
        description:
          '"시니어 소프트웨어 엔지니어로서 레거시 코드 리팩토링을 위한 단계적 접근법을 설명하세요. 1) 테스트 커버리지 확보 2) 코드 냄새 식별 3) 작은 단위로 점진적 개선 4) 지속적 통합(CI)으로 검증하는 Strangler Fig Pattern을 구체적인 예시와 함께 설명하세요."',
      },
      {
        id: "02",
        title: "리스크 관리 우선 접근",
        description:
          '"테크 리드로서 비즈니스 리스크를 최소화하면서 레거시 코드를 안전하게 리팩토링하는 방법을 설명하세요. Feature Flag를 활용한 점진적 롤아웃, 충분한 모니터링 설정, 롤백 계획 수립, 팀 리뷰 프로세스를 포함한 리스크 완화 전략을 제시하세요."',
      },
      {
        id: "03",
        title: "아키텍처 현대화 관점",
        description:
          '"소프트웨어 아키텍트로서 레거시 시스템을 현대적 아키텍처로 전환하는 전략을 제시하세요. 모놀리스에서 마이크로서비스로의 점진적 분리, 의존성 역전 원칙 적용, 이벤트 기반 아키텍처 도입을 포함한 중장기 기술 부채 해소 로드맵을 작성하세요."',
      },
    ],
  },
};

// ─── 컴포넌트 ─────────────────────────────────────────────────
export default function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = MOCK_HISTORY_DATA[id];

  // 데이터 없음 처리
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        <p className="text-[#757684] text-[18px]">대화 기록을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const { title, date, originalPrompt, versions } = data;

  return (
    <div className="flex flex-col items-start w-full max-w-6xl mx-auto h-full pt-12 pb-16 px-6 overflow-x-clip">

      {/* ── 페이지 헤더 ── */}
      <div className="w-full mb-12">
        <div className="inline-flex items-center px-3 py-1 bg-[#d9e2ff] rounded-full mb-4">
          <span className="text-[#001945] text-xs font-medium">대화 기록 · {date}</span>
        </div>

        <h1 className="text-[40px] font-bold text-[#191c1e] tracking-[-1px] leading-[46px] mb-3">
          {title}
        </h1>
        <p className="text-[#454652] text-[16px]">
          입력한 프롬프트와 AI가 생성한 후보군을 확인할 수 있습니다.
        </p>
      </div>

      {/* ── 사용자 입력 ── */}
      <div className="w-full mb-12">
        <div className="flex-1 border-l-4 border-[#2b3896] bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-4">
            <Edit2 className="w-4 h-4 text-gray-500" />
            <span className="text-[#757684] text-sm tracking-[1.4px] font-medium uppercase">
              사용자 입력
            </span>
          </div>
          <p className="text-[#191c1e] text-[20px] leading-[32.5px] italic font-medium">
            &ldquo;{originalPrompt}&rdquo;
          </p>
        </div>
      </div>

      {/* ── 후보군 헤더 ── */}
      <div className="w-full flex items-center mb-6">
        <h2 className="text-[24px] text-[#191c1e] mr-4 whitespace-nowrap">
          프롬프트 후보군
        </h2>
        <div className="flex-1 h-px bg-[#e0e3e5]" />
      </div>

      {/* ── 3D 캐러셀 ── */}
      <div className="w-full relative py-6">
        <div className="relative w-full max-w-[1000px] mx-auto h-[420px] flex items-center justify-center">

          {/* 왼쪽 화살표 */}
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev > 0 ? prev - 1 : versions.length - 1))
            }
            className="absolute left-[10px] md:-left-4 z-30 flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-[#454652] hover:text-[#003e93] hover:scale-105 transition-all"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {versions.map((version, idx) => {
            let offset = idx - currentIndex;
            if (offset < -1) offset += versions.length;
            if (offset > 1) offset -= versions.length;

            const isCenter = offset === 0;
            let transformStr = "translateX(0) scale(1)";
            if (offset === -1) transformStr = "translateX(-65%) scale(0.85)";
            if (offset === 1) transformStr = "translateX(65%) scale(0.85)";

            return (
              <div
                key={version.id}
                className={`absolute top-2 w-full max-w-[600px] h-[390px] flex flex-col bg-white rounded-xl p-10 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${
                  isCenter
                    ? "border-t-4 border-[#003e93] shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-20"
                    : "border-t-4 border-transparent shadow-sm opacity-50 z-10"
                }`}
                style={{
                  transform: transformStr,
                  pointerEvents: isCenter ? "auto" : "none",
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-semibold tracking-[1.4px] uppercase text-[#2b3896]">
                    버전 {version.id}
                  </span>
                </div>

                <h3 className="text-[22px] font-medium text-[#191c1e] mb-5">
                  {version.title}
                </h3>

                <div className="flex-1 overflow-y-auto pr-2">
                  <p className="text-[16px] text-[#454652] leading-[28px]">
                    {version.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* 오른쪽 화살표 */}
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev < versions.length - 1 ? prev + 1 : 0))
            }
            className="absolute right-[10px] md:-right-4 z-30 flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-[#454652] hover:text-[#003e93] hover:scale-105 transition-all"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* ── 슬라이드 인디케이터 ── */}
      <div className="w-full flex justify-center items-center gap-3 mt-4">
        {versions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-3 rounded-full transition-all ${
              idx === currentIndex
                ? "bg-[#003e93] w-8"
                : "bg-[#e0e3e5] w-3 hover:bg-[#c5c5d4]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
