"use client";

import { useEffect, useRef, useState } from "react";
import { PromptCandidateType } from "@/schemas/promptSchema";

/**
 * 표시 전용 번역 훅.
 * 미디어(image/video/music) content는 항상 영어로 생성되므로, 한국어 UI일 때만
 * 후보별 content를 한국어로 번역해 둔다. 복사는 호출 측에서 원문(content)을 그대로 쓴다.
 *
 * - language !== 'ko' 이거나 모달리티가 text면 번역하지 않음(원문이 곧 표시본).
 * - 후보별 1회만 요청(candidateId 기준 캐시), 실패 시 조용히 원문 폴백.
 */
export function useTranslatedPrompts(
  candidates: PromptCandidateType[],
  language: string
) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const requestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (language !== "ko") return;

    const targets = candidates.filter(
      (c) =>
        c.metadata.targetModality &&
        c.metadata.targetModality !== "text" &&
        !requestedRef.current.has(c.candidateId)
    );
    if (targets.length === 0) return;

    let cancelled = false;
    for (const c of targets) {
      const id = c.candidateId;
      requestedRef.current.add(id);
      setPending((p) => ({ ...p, [id]: true }));

      (async () => {
        try {
          const res = await fetch("/api/prompts/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: c.content, targetLanguage: "ko" }),
          });
          const json = await res.json();
          if (!cancelled && json?.success && json.data?.translatedText) {
            setTranslations((prev) => ({ ...prev, [id]: json.data.translatedText }));
          }
        } catch {
          /* 실패 시 원문 표시로 폴백 (별도 처리 없음) */
        } finally {
          if (!cancelled) setPending((p) => ({ ...p, [id]: false }));
        }
      })();
    }

    return () => {
      cancelled = true;
    };
  }, [candidates, language]);

  return { translations, pending };
}
