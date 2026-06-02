// ── 멀티모달 공용 정의 ────────────────────────────────────────────────────────
// aiService(가중치 읽기 + 프롬프트 생성)와 feedbackService(가중치 쓰기)가 동일한
// 차원 목록·카테고리 키 규칙을 공유하도록 분리한 경량 모듈.

export type Modality = 'text' | 'image' | 'video' | 'music';

export const MODALITIES: Modality[] = ['text', 'image', 'video', 'music'];

// 모달리티별 선호도 가중치 차원 (각 차원은 1~5 tier 스니펫을 가짐)
export const MODALITY_DIMENSIONS: Record<Modality, string[]> = {
  text: ['tone', 'level', 'density', 'creativity'],
  image: ['style', 'detail', 'lighting', 'color'],
  video: ['camera', 'pacing', 'realism', 'mood'],
  music: ['tempo', 'energy', 'instrumentation', 'genre'],
};

// user_preferences.category 키 규칙.
// text는 기존 데이터 호환을 위해 평면 키(tone/level/...)를 유지하고,
// 비텍스트는 모달리티로 네임스페이스해 차원명 충돌을 방지한다. (예: video.camera)
export function prefKey(modality: Modality, dimension: string): string {
  return modality === 'text' ? dimension : `${modality}.${dimension}`;
}

export function isModality(value: unknown): value is Modality {
  return typeof value === 'string' && (MODALITIES as string[]).includes(value);
}

// category 문자열 → { modality, dimension } 역파싱 (analytics 등 클라이언트 표시용)
export function parsePrefKey(category: string): { modality: Modality; dimension: string } {
  const dotIdx = category.indexOf('.');
  if (dotIdx > 0) {
    const maybeModality = category.slice(0, dotIdx);
    if (isModality(maybeModality)) {
      return { modality: maybeModality, dimension: category.slice(dotIdx + 1) };
    }
  }
  // 평면 키는 text 차원 (tone/level/density/creativity)
  return { modality: 'text', dimension: category };
}

// 모달리티/차원의 한·영 표시 레이블 (클라이언트 표시 전용 — 서버 의존성 없음)
type Bi = { ko: string; en: string };

export const MODALITY_DISPLAY: Record<Modality, Bi> = {
  text: { ko: '텍스트', en: 'Text' },
  image: { ko: '이미지', en: 'Image' },
  video: { ko: '영상', en: 'Video' },
  music: { ko: '음악', en: 'Music' },
};

export const DIMENSION_DISPLAY: Record<Modality, Record<string, Bi>> = {
  text: {
    tone: { ko: '어투', en: 'Tone' },
    level: { ko: '어휘 수준', en: 'Vocabulary' },
    density: { ko: '정보 밀도', en: 'Density' },
    creativity: { ko: '창의성', en: 'Creativity' },
  },
  image: {
    style: { ko: '화풍', en: 'Style' },
    detail: { ko: '디테일', en: 'Detail' },
    lighting: { ko: '조명', en: 'Lighting' },
    color: { ko: '색감', en: 'Color' },
  },
  video: {
    camera: { ko: '카메라', en: 'Camera' },
    pacing: { ko: '페이싱', en: 'Pacing' },
    realism: { ko: '질감', en: 'Realism' },
    mood: { ko: '분위기', en: 'Mood' },
  },
  music: {
    tempo: { ko: '템포', en: 'Tempo' },
    energy: { ko: '에너지', en: 'Energy' },
    instrumentation: { ko: '편성', en: 'Instrumentation' },
    genre: { ko: '장르', en: 'Genre' },
  },
};
