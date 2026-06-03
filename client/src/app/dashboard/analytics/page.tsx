"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useLanguageContext } from "@/lib/i18n/LanguageProvider";
import {
  MODALITIES,
  MODALITY_DIMENSIONS,
  MODALITY_DISPLAY,
  DIMENSION_DISPLAY,
  prefKey,
  LEAN_CLAMP,
} from "@/lib/services/modality";

type Bi = { ko: string; en: string };

const DIMENSION_ENDS: Record<string, Record<string, { left: Bi; right: Bi }>> = {
  text: {
    tone:       { left: { ko: '극도 건조',   en: 'Ultra Dry'      }, right: { ko: '유머러스',       en: 'Humorous'       } },
    level:      { left: { ko: '친숙한 표현',   en: 'Everyday Words' }, right: { ko: '전문 어휘',      en: 'Expert Terms'   } },
    density:    { left: { ko: '초간결',       en: 'Ultra Concise'  }, right: { ko: '초상세',         en: 'Exhaustive'     } },
    creativity: { left: { ko: '정석',         en: 'Orthodox'       }, right: { ko: '파격적',         en: 'Unconventional' } },
  },
  image: {
    style:    { left: { ko: '포토리얼',  en: 'Photorealistic' }, right: { ko: '추상적',        en: 'Abstract'      } },
    detail:   { left: { ko: '미니멀',    en: 'Minimal'        }, right: { ko: '하이퍼디테일',  en: 'Hyper-detail'  } },
    lighting: { left: { ko: '평면 조명', en: 'Flat'           }, right: { ko: '시네마틱',      en: 'Cinematic'     } },
    color:    { left: { ko: '무채색',    en: 'Monochrome'     }, right: { ko: '비비드',        en: 'Vivid'         } },
  },
  video: {
    camera:  { left: { ko: '고정 샷',  en: 'Static'      }, right: { ko: '역동적',  en: 'Dynamic'      } },
    pacing:  { left: { ko: '롱테이크', en: 'Long Take'   }, right: { ko: '빠른 컷', en: 'Fast Cut'     } },
    realism: { left: { ko: '실사',     en: 'Live-action' }, right: { ko: 'CG/애니', en: 'CG/Animated'  } },
    mood:    { left: { ko: '잔잔함',   en: 'Calm'        }, right: { ko: '극적',    en: 'Dramatic'     } },
  },
  music: {
    tempo:           { left: { ko: '느린 템포', en: 'Slow'          }, right: { ko: '빠른 템포',     en: 'Fast'          } },
    energy:          { left: { ko: '앰비언트',  en: 'Ambient'       }, right: { ko: '하이 에너지',   en: 'High Energy'   } },
    instrumentation: { left: { ko: '미니멀',    en: 'Minimal'       }, right: { ko: '풀 오케스트라', en: 'Full Orchestra' } },
    genre:           { left: { ko: '정통',      en: 'Classic'       }, right: { ko: '실험적',        en: 'Experimental'  } },
  },
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { language } = useLanguageContext();
  const lang = (language === "en" ? "en" : "ko") as "ko" | "en";
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPreferences() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("user_preferences")
        .select("category, weight_score")
        .eq("user_id", user.id);

      if (!error && data) {
        const map: Record<string, number> = {};
        data.forEach((row) => {
          map[row.category] = row.weight_score;
        });
        setWeights(map);
      }
      setIsLoading(false);
    }
    fetchPreferences();
  }, [user]);

  // 텍스트(절대 가중치): 미존재 시 1.0(중립). 0~2.0 → 0~100%
  const pct = (category: string) =>
    isLoading ? 0 : Math.round(((weights[category] ?? 1.0) / 2.0) * 100);

  // 텍스트 가중치 → tier 1~5
  const textTier = (category: string): number => {
    const score = isLoading ? 1.0 : (weights[category] ?? 1.0);
    if (score <= 0.5) return 1;
    if (score <= 0.8) return 2;
    if (score <= 1.2) return 3;
    if (score <= 1.5) return 4;
    return 5;
  };

  // 미디어(잔차 lean): 미존재 시 0(주제 baseline 그대로). -LEAN_CLAMP~+LEAN_CLAMP.
  const lean = (category: string) => (isLoading ? 0 : weights[category] ?? 0);
  // lean → 중앙(50%) 기준 좌/우 다이버징 막대의 [left%, width%]
  const leanBar = (category: string) => {
    const ratio = Math.max(-1, Math.min(1, lean(category) / LEAN_CLAMP)); // -1..1
    const half = Math.abs(ratio) * 50;
    return ratio >= 0
      ? { left: 50, width: half }
      : { left: 50 - half, width: half };
  };

  // 미디어 lean → tier 1~5 (중앙 3 = baseline)
  const mediaTier = (category: string): number => {
    const ratio = Math.max(-1, Math.min(1, lean(category) / LEAN_CLAMP));
    return Math.round(((ratio + 1) / 2) * 4) + 1;
  };

  const tierLabel = (tier: number) =>
    lang === "ko" ? `${tier}단계` : `Tier ${tier}`;

  return (
    <div className="flex flex-col gap-[40px] items-start w-full max-w-[896px] py-[48px] mx-auto z-10 relative">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[#191c1e] text-[36px] font-bold tracking-[-0.9px] leading-[40px]">
          {t("analytics.title")}
        </h1>
        <p className="text-[#454652] text-[18px] leading-[28px]">
          {t("analytics.subtitle")}
        </p>
      </div>

      {/* Content Area */}
      <div className="flex w-full">
        <div className="bg-white border border-[#c5c5d4]/10 w-full max-w-[802px] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-[20px] md:p-[33px] flex flex-col gap-10">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-[#191c1e] text-[20px] font-medium leading-[28px]">
              {t("analytics.weights")}
            </h2>
            <div className="bg-[#d9e2ff] flex items-center gap-1.5 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#001945]" />
              <span className="text-[#001945] text-[12px] font-medium">
                {t("analytics.optimized")}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-12">
            {MODALITIES.map((modality) => (
              <div key={modality} className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[#191c1e] text-[16px] font-semibold tracking-[-0.4px]">
                    {MODALITY_DISPLAY[modality][lang]}
                  </span>
                  <div className="flex-1 h-px bg-[#eceef0]" />
                </div>

                <div className="flex flex-col gap-8">
                  {MODALITY_DIMENSIONS[modality].map((dim) => {
                    const category = prefKey(modality, dim);
                    const isText = modality === "text";
                    const bar = leanBar(category);
                    const ends = DIMENSION_ENDS[modality]?.[dim];
                    return (
                      <div key={category} className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#2b3896]" />
                            <span className="text-[#454652] text-[14px] font-semibold tracking-[-0.35px]">
                              {DIMENSION_DISPLAY[modality][dim][lang]}
                            </span>
                          </div>
                        </div>
                        {/* 5구간 세그먼트 게이지 */}
                        <div className="flex gap-[3px] w-full">
                          {[1, 2, 3, 4, 5].map((seg) => {
                            const tier = isText ? textTier(category) : mediaTier(category);
                            // 텍스트: 왼쪽부터 tier까지 채움
                            // 미디어: 중앙(3) 기준으로 tier 방향까지 채움
                            // 텍스트/미디어 모두 중앙(3) 기준 다이버징
                            const filled = tier >= 3
                              ? seg >= 3 && seg <= tier
                              : seg <= 3 && seg >= tier;
                            const isFirst = seg === 1;
                            const isLast = seg === 5;
                            return (
                              <div
                                key={seg}
                                className={`h-3 flex-1 transition-all duration-700 ease-in-out ${
                                  filled ? "bg-[#2b3896]" : "bg-[#f2f4f6]"
                                } ${isFirst ? "rounded-l-full" : ""} ${isLast ? "rounded-r-full" : ""}`}
                              />
                            );
                          })}
                        </div>
                        {/* 양 끝 레이블 */}
                        {ends && (
                          <div className="flex justify-between">
                            <span className="text-[#9ca3af] text-[11px] leading-[16px]">
                              {ends.left[lang]}
                            </span>
                            <span className="text-[#9ca3af] text-[11px] leading-[16px]">
                              {ends.right[lang]}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
