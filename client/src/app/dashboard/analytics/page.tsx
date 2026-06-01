"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Preferences = { tone: number; level: number; density: number; creativity: number };
const DEFAULT_PREFS: Preferences = { tone: 1.0, level: 1.0, density: 1.0, creativity: 1.0 };

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
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

      if (!error && data && data.length > 0) {
        const updated = { ...DEFAULT_PREFS };
        data.forEach((row) => {
          if (row.category in updated) {
            updated[row.category as keyof Preferences] = row.weight_score;
          }
        });
        setPrefs(updated);
      }
      setIsLoading(false);
    }
    fetchPreferences();
  }, [user]);

  // Convert weight_score (0~2.0) to step 1~5
  const toStep = (key: keyof Preferences): number => {
    if (isLoading) return 0;
    // 0~2.0 → 1~5: clamp to [0, 2], map to [1, 5]
    const clamped = Math.max(0, Math.min(2.0, prefs[key]));
    return Math.round(1 + (clamped / 2.0) * 4);
  };

  const items: {
    key: keyof Preferences;
    labelKey: string;
    startLabel: { ko: string; en: string };
    endLabel: { ko: string; en: string };
  }[] = [
    {
      key: "tone",
      labelKey: "analytics.tone",
      startLabel: { ko: "간결함", en: "Concise" },
      endLabel:   { ko: "자세함", en: "Detailed" },
    },
    {
      key: "level",
      labelKey: "analytics.level",
      startLabel: { ko: "쉬운",   en: "Simple" },
      endLabel:   { ko: "전문적", en: "Expert" },
    },
    {
      key: "density",
      labelKey: "analytics.density",
      startLabel: { ko: "가벼운", en: "Light" },
      endLabel:   { ko: "빽빽한", en: "Dense" },
    },
    {
      key: "creativity",
      labelKey: "analytics.creativity",
      startLabel: { ko: "보수적", en: "Conservative" },
      endLabel:   { ko: "창의적", en: "Creative" },
    },
  ];


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

          <div className="flex flex-col gap-10">
            {items.map(({ key, labelKey, startLabel, endLabel }) => {
              const step = toStep(key);
              return (
                <div key={key} className="flex flex-col gap-3">
                  {/* Label row */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#2b3896]" />
                    <span className="text-[#454652] text-[14px] font-semibold tracking-[-0.35px]">
                      {t(labelKey as any)}
                    </span>
                  </div>

                  {/* Step bar row */}
                  <div className="flex items-center gap-3">
                    {/* Left pole label */}
                    <span className="text-[#9093a4] text-[12px] font-medium whitespace-nowrap w-[52px] text-right shrink-0">
                      {language === "ko" ? startLabel.ko : startLabel.en}
                    </span>

                    {/* 5-step track — absolute layout for equal spacing */}
                    <div className="relative flex-1" style={{ height: "22px" }}>
                      {/* Background track */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#e8eaf0] rounded-full" />
                      {/* Active fill track */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-[3px] bg-[#2b3896] rounded-full transition-all duration-700"
                        style={{
                          left: 0,
                          width: isLoading || step <= 1
                            ? "0%"
                            : `${((step - 1) / 4) * 100}%`,
                        }}
                      />
                      {/* Dots at 0%, 25%, 50%, 75%, 100% */}
                      {[1, 2, 3, 4, 5].map((s) => {
                        const isActive  = !isLoading && s <= step;
                        const isCurrent = !isLoading && s === step;
                        const pct = ((s - 1) / 4) * 100;
                        return (
                          <div
                            key={s}
                            className="absolute top-1/2 rounded-full transition-all duration-700 flex items-center justify-center"
                            style={{
                              left: `${pct}%`,
                              transform: "translate(-50%, -50%)",
                              width:  isCurrent ? "22px" : "12px",
                              height: isCurrent ? "22px" : "12px",
                              backgroundColor: isActive ? "#2b3896" : "#e8eaf0",
                              boxShadow: isCurrent ? "0 0 0 4px rgba(43,56,150,0.18)" : "none",
                            }}
                          >
                            {isCurrent && (
                              <span className="text-white text-[11px] font-bold leading-none">
                                {s}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Right pole label */}
                    <span className="text-[#9093a4] text-[12px] font-medium whitespace-nowrap w-[52px] shrink-0">
                      {language === "ko" ? endLabel.ko : endLabel.en}
                    </span>
                  </div>

                  {/* Step count label */}
                  <div className="flex justify-center">
                    <span className="text-[#2b3896] text-[12px] font-semibold">
                      {isLoading ? "—" : `${step}${language === "ko" ? "단계" : " / 5"}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
