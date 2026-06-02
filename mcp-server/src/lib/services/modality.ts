// ── 멀티모달 공용 정의 ────────────────────────────────────────────────────────
// aiService(가중치 읽기 + 프롬프트 생성)와 feedbackService(가중치 쓰기)가 동일한
// 차원 목록·카테고리 키 규칙을 공유하도록 분리한 경량 모듈. (client 사본과 동일 규칙)

export type Modality = 'text' | 'image' | 'video' | 'music';

export const MODALITIES: Modality[] = ['text', 'image', 'video', 'music'];

export const MODALITY_DIMENSIONS: Record<Modality, string[]> = {
  text: ['tone', 'level', 'density', 'creativity'],
  image: ['style', 'detail', 'lighting', 'color'],
  video: ['camera', 'pacing', 'realism', 'mood'],
  music: ['tempo', 'energy', 'instrumentation', 'genre'],
};

// user_preferences.category 키 규칙. text는 기존 평면 키 유지, 비텍스트는 모달리티 네임스페이스.
export function prefKey(modality: Modality, dimension: string): string {
  return modality === 'text' ? dimension : `${modality}.${dimension}`;
}

export function isModality(value: unknown): value is Modality {
  return typeof value === 'string' && (MODALITIES as string[]).includes(value);
}
