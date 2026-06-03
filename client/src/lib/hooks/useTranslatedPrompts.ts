"use client";

import { useEffect, useRef, useState } from "react";

// 번역 대상이 되기 위한 최소 구조 (AnalysisResult의 PromptCandidateType,
// 히스토리 페이지의 Candidate 둘 다 구조적으로 호환된다).
type TranslatableCandidate = {
  candidateId: string;
  content: string;
  logId?: string;
  metadata: { targetModality?: string | null };
};

/**
 * 표시 전용 번역 훅.
 * 미디어(image/video/music) content는 항상 영어로 생성되므로, 한국어 UI일 때만
 * 후보별 content를 한국어로 번역해 둔다. 복사는 호출 측에서 원문(content)을 그대로 쓴다.
 *
 * - language !== 'ko' 이거나 모달리티가 text면 번역하지 않음(원문이 곧 표시본).
 * - initial(저장된 번역본, candidateId→text)이 있으면 시드로 사용하고 재요청하지 않음.
 *   (히스토리: prompt_logs.translated_prompt 를 그대로 표시 → 재번역 비용 0)
 * - 저장본이 없는 후보만 1회 요청(candidateId 기준 캐시). logId가 있으면 서버가
 *   번역본을 prompt_logs에 저장하므로 다음 조회부터는 재번역되지 않는다.
 * - 실패 시 조용히 원문 폴백.
 */
export function useTranslatedPrompts(
  candidates: TranslatableCandidate[],
  language: string,
  initial?: Record<string, string>
) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const requestedRef = useRef<Set<string>>(new Set());

  // 저장된 번역본 시드: translations에 채우고 requestedRef에 등록해 재요청을 막는다.
  useEffect(() => {
    if (!initial) return;
    const seed = Object.entries(initial).filter(
      ([id, text]) => text && !requestedRef.current.has(id)
    );
    if (seed.length === 0) return; // 이미 시드됨 → setState 없이 종료(루프 방지)
    for (const [id] of seed) requestedRef.current.add(id);
    setTranslations((prev) => ({ ...prev, ...Object.fromEntries(seed) }));
  }, [initial]);

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
            // logId를 함께 보내면 서버가 번역본을 prompt_logs에 저장(persist-on-view).
            body: JSON.stringify({ text: c.content, targetLanguage: "ko", logId: c.logId }),
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
