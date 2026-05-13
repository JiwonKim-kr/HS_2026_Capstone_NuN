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
  const { t } = useTranslation();
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

  const pct = (key: keyof Preferences) =>
    isLoading ? 0 : Math.round((prefs[key] / 2.0) * 100);

  const items: { key: keyof Preferences; labelKey: string }[] = [
    { key: "tone",       labelKey: "analytics.tone" },
    { key: "level",      labelKey: "analytics.level" },
    { key: "density",    labelKey: "analytics.density" },
    { key: "creativity", labelKey: "analytics.creativity" },
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
            {items.map(({ key, labelKey }) => (
              <div key={key} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#2b3896]" />
                    <span className="text-[#454652] text-[14px] font-semibold tracking-[-0.35px]">
                      {t(labelKey as any)}
                    </span>
                  </div>
                  <span className="text-[#2b3896] text-[18px] font-bold leading-none">
                    {pct(key)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-[#f2f4f6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2b3896] rounded-full transition-all duration-1000 ease-in-out"
                    style={{ width: `${pct(key)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
