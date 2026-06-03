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

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { language } = useLanguageContext();
  const lang = (language === "en" ? "en" : "ko") as "ko" | "en";
  // category(prefKey) → weight_score
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
  const leanLabel = (category: string) => {
    const v = lean(category);
    return `${v >= 0 ? "+" : ""}${v.toFixed(1)}`;
  };

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
                    return (
                      <div key={category} className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#2b3896]" />
                            <span className="text-[#454652] text-[14px] font-semibold tracking-[-0.35px]">
                              {DIMENSION_DISPLAY[modality][dim][lang]}
                            </span>
                          </div>
                          <span className="text-[#2b3896] text-[18px] font-bold leading-none">
                            {isText ? `${pct(category)}%` : leanLabel(category)}
                          </span>
                        </div>
                        {isText ? (
                          // 텍스트: 절대 가중치 0~100% 막대
                          <div className="w-full h-3 bg-[#f2f4f6] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2b3896] rounded-full transition-all duration-1000 ease-in-out"
                              style={{ width: `${pct(category)}%` }}
                            />
                          </div>
                        ) : (
                          // 미디어: 주제 baseline(중앙) 기준 좌(약하게)/우(강하게) 다이버징 막대
                          <div className="relative w-full h-3 bg-[#f2f4f6] rounded-full overflow-hidden">
                            <div className="absolute left-1/2 top-0 h-full w-px bg-[#c5c5d4]" />
                            <div
                              className="absolute h-full bg-[#2b3896] transition-all duration-1000 ease-in-out"
                              style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
                            />
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
