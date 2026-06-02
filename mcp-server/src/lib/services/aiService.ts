import { anthropic } from '@ai-sdk/anthropic';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { GeneratePromptRequestType, promptGenerationSchema } from '../../schemas/promptSchema.js';
import { Modality, MODALITY_DIMENSIONS, prefKey } from './modality.js';
import { randomUUID } from 'crypto';
import { supabase } from '../supabaseAdmin.js';

// ── 가중치 임계값 → tier 매핑 (information.md Section 2~3) ─────────────────────
const TIER_THRESHOLDS: { maxScore: number; tier: number }[] = [
  { maxScore: 0.5, tier: 1 },
  { maxScore: 0.8, tier: 2 },
  { maxScore: 1.2, tier: 3 },  // 중립 — snippet은 빈 문자열
  { maxScore: 1.5, tier: 4 },
  { maxScore: 2.0, tier: 5 },
];

const MIN_TIER = TIER_THRESHOLDS[0].tier;
const MAX_TIER = TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1].tier;

type SnippetMap = Record<number, string>;
type LangSnippetMap = { ko: SnippetMap; en: SnippetMap };

// ── 모달리티 × 차원별 tier 스니펫 맵 ──────────────────────────────────────────
const DIMENSION_SNIPPETS: Record<Modality, Record<string, LangSnippetMap>> = {
  text: {
    tone: {
      ko: {
        1: '- [어투]: 감정과 수식어를 완전히 배제하고, 가장 건조하고 객관적인 문체(하다체)로 작성할 것.',
        2: '- [어투]: 감정 표현을 자제하고, 정중하고 격식 있는 비즈니스 톤(하십시오체)을 유지할 것.',
        3: '',
        4: '- [어투]: 친근하고 대화하는 듯한 부드러운 어투를 사용하며, 가벼운 감정 표현이나 공감을 포함할 것.',
        5: '- [어투]: 매우 유머러스하고 재치 있는 어투를 사용하며, 상황에 맞는 이모지와 밈(Meme)을 적극적으로 활용할 것.',
      },
      en: {
        1: '- [Tone]: Write in the driest, most objective, and purely factual style possible. Omit all emotion and embellishment.',
        2: '- [Tone]: Keep a formal, polished business tone. Minimize emotional expression.',
        3: '',
        4: '- [Tone]: Use a friendly, conversational, and warm tone. Light emotional expression and empathy are encouraged.',
        5: '- [Tone]: Be highly humorous and witty. Actively incorporate relevant emojis and memes where appropriate.',
      },
    },
    level: {
      ko: {
        1: '- [어휘 수준]: 타겟 독자는 해당 지식이 전혀 없는 초보자입니다. 전문 용어를 철저히 배제하고 상위 1,000개 이내의 쉬운 일상 단어로만 설명할 것.',
        2: '- [어휘 수준]: 타겟 독자는 입문자입니다. 기초 개념 위주로 서술하되, 불가피한 전문 용어 사용 시 반드시 뜻을 풀이할 것.',
        3: '',
        4: '- [어휘 수준]: 타겟 독자는 관련 전공자/실무자입니다. 업계 표준 용어, 약어, 그리고 실무적인 개념을 주저 없이 사용할 것.',
        5: '- [어휘 수준]: 타겟 독자는 해당 분야의 시니어/최고 전문가입니다. 논문 수준의 심층 어휘를 사용하고, 필요시 권위 있는 출처나 원리를 인용할 것.',
      },
      en: {
        1: '- [Vocabulary Level]: The target audience has zero prior knowledge. Strictly avoid jargon and use only the top 1,000 most common everyday words.',
        2: '- [Vocabulary Level]: The target audience is a beginner. Focus on fundamental concepts; if technical terms are unavoidable, always define them immediately.',
        3: '',
        4: '- [Vocabulary Level]: The target audience consists of professionals or domain experts. Freely use industry-standard terminology, abbreviations, and advanced concepts.',
        5: '- [Vocabulary Level]: The target audience is a senior specialist or top expert. Use academic-level, deeply technical vocabulary and cite authoritative sources or core principles when relevant.',
      },
    },
    density: {
      ko: {
        1: '- [정보 밀도]: 부연 설명을 모두 생략하고, 핵심만 3줄 이내의 개조식(Bullet points)으로 극도로 요약할 것.',
        2: '- [정보 밀도]: 주요 특징만 간략히 나열하며, 불필요한 예시나 장황한 배경 설명은 제외할 것.',
        3: '',
        4: '- [정보 밀도]: 하위 목차를 세분화하여 구조적으로 서술하고, 다양한 엣지 케이스와 구체적인 예시를 3개 이상 다룰 것.',
        5: '- [정보 밀도]: 가능한 모든 세부 정보, 작동 원리, 예외 상황, 역사적 배경 등을 TMI 수준으로 촘촘하고 매우 길게 서술할 것.',
      },
      en: {
        1: '- [Information Density]: Omit all elaboration. Present only the core point in 3 bullet points or fewer.',
        2: '- [Information Density]: List only key characteristics briefly. Exclude unnecessary examples and verbose background context.',
        3: '',
        4: '- [Information Density]: Structure the response with detailed sub-sections and cover at least 3 concrete examples and edge cases.',
        5: '- [Information Density]: Include every possible detail — mechanics, exceptions, historical background, etc. — in an exhaustively long and comprehensive response.',
      },
    },
    creativity: {
      ko: {
        1: '- [창의성]: 가장 널리 검증되고 정석적인 단일 해결책이나 교과서적인 정의만 정확하게 제시할 것.',
        2: '- [창의성]: 표준적인 접근을 유지하되, 약간의 실무적 팁이나 대중적인 비유를 한 가지 정도 곁들일 것.',
        3: '',
        4: '- [창의성]: 기존의 틀을 깨는 참신한 시각과 독창적인 비유를 활용하여 다각도에서 아이디어를 확장할 것.',
        5: '- [창의성]: 완전히 파격적이고 도발적인 접근법을 포함하며, 이질적인 개념들을 융합한 브레인스토밍 결과를 제시할 것.',
      },
      en: {
        1: '- [Creativity]: Present only the single most widely accepted, textbook-correct solution or definition.',
        2: '- [Creativity]: Stick to standard approaches, but include one practical tip or a popular analogy.',
        3: '',
        4: '- [Creativity]: Challenge conventional thinking with fresh perspectives and original analogies, expanding ideas from multiple angles.',
        5: '- [Creativity]: Embrace fully unconventional and provocative approaches, fusing disparate concepts into bold brainstorming results.',
      },
    },
  },

  image: {
    style: {
      ko: {
        1: '- [화풍]: 극사실적인 포토리얼리즘. 실제 사진과 구분 불가능한 수준의 사실적 질감과 디테일을 묘사할 것.',
        2: '- [화풍]: 사실적인 묘사를 기반으로 하되, 약간의 회화적 표현을 허용할 것.',
        3: '',
        4: '- [화풍]: 양식화된 일러스트레이션 스타일. 명확한 라인과 디자인 감각이 드러나는 작화를 지향할 것.',
        5: '- [화풍]: 추상적이고 실험적인 아트 스타일. 비현실적 형태, 콜라주, 초현실주의적 표현을 적극 활용할 것.',
      },
      en: {
        1: '- [Style]: Extreme photorealism. Render textures and details indistinguishable from a real photograph.',
        2: '- [Style]: Realistic depiction with a slight painterly touch allowed.',
        3: '',
        4: '- [Style]: Stylized illustration with clean linework and strong design sensibility.',
        5: '- [Style]: Abstract and experimental art — embrace surreal forms, collage, and unconventional expression.',
      },
    },
    detail: {
      ko: {
        1: '- [디테일]: 미니멀하고 단순한 구성. 핵심 피사체만 남기고 배경과 장식 요소를 최소화할 것.',
        2: '- [디테일]: 깔끔하고 정돈된 구성. 불필요한 요소를 배제하고 명료하게 표현할 것.',
        3: '',
        4: '- [디테일]: 정교한 디테일. 질감, 패턴, 부수적 소품을 풍부하게 묘사할 것.',
        5: '- [디테일]: 초정밀 하이퍼디테일. 미세한 질감과 복잡한 디테일까지 극한으로 표현할 것.',
      },
      en: {
        1: '- [Detail]: Minimal and simple composition. Keep only the key subject, minimizing background and decoration.',
        2: '- [Detail]: Clean, uncluttered composition. Exclude unnecessary elements for clarity.',
        3: '',
        4: '- [Detail]: Intricate detail. Richly render textures, patterns, and secondary props.',
        5: '- [Detail]: Ultra hyper-detailed. Push fine textures and complex detail to the extreme.',
      },
    },
    lighting: {
      ko: {
        1: '- [조명]: 평면적이고 균일한 조명. 그림자를 최소화한 부드럽고 중립적인 광원을 사용할 것.',
        2: '- [조명]: 자연스러운 일상 조명. 과하지 않은 부드러운 빛을 사용할 것.',
        3: '',
        4: '- [조명]: 분위기 있는 입체 조명. 명암 대비와 방향성 있는 빛을 활용할 것.',
        5: '- [조명]: 극적인 시네마틱 조명. 강한 명암 대비, 림 라이트, 볼류메트릭 라이팅을 적극 활용할 것.',
      },
      en: {
        1: '- [Lighting]: Flat, even lighting. Use a soft, neutral source with minimal shadows.',
        2: '- [Lighting]: Natural everyday lighting. Use soft, understated light.',
        3: '',
        4: '- [Lighting]: Atmospheric, dimensional lighting. Employ contrast and directional light.',
        5: '- [Lighting]: Dramatic cinematic lighting. Aggressively use strong contrast, rim light, and volumetric lighting.',
      },
    },
    color: {
      ko: {
        1: '- [색감]: 모노톤 또는 매우 차분한 무채색 위주의 팔레트를 사용할 것.',
        2: '- [색감]: 차분하고 절제된(muted) 색조를 유지할 것.',
        3: '',
        4: '- [색감]: 선명하고 풍부한 색감을 사용하여 시각적 생동감을 부여할 것.',
        5: '- [색감]: 고채도의 비비드한 네온/팝 컬러를 폭발적으로 사용할 것.',
      },
      en: {
        1: '- [Color]: Use a monochrome or heavily desaturated achromatic palette.',
        2: '- [Color]: Keep a calm, muted color scheme.',
        3: '',
        4: '- [Color]: Use vivid, rich colors for visual vibrancy.',
        5: '- [Color]: Explode with high-saturation neon/pop colors.',
      },
    },
  },

  video: {
    camera: {
      ko: {
        1: '- [카메라]: 완전히 고정된 정적인 샷(fixed shot). 카메라 움직임 없이 안정적인 프레임을 유지할 것.',
        2: '- [카메라]: 미세하고 절제된 카메라 움직임만 허용할 것.',
        3: '',
        4: '- [카메라]: 적극적인 카메라 무빙. 패닝, 트래킹, 돌리 등 동적인 촬영 기법을 활용할 것.',
        5: '- [카메라]: 매우 역동적인 카메라 워크. 핸드헬드, 드론 샷, 급격한 줌과 회전을 적극 활용할 것.',
      },
      en: {
        1: '- [Camera]: A completely fixed, static shot. Keep a stable frame with no camera movement.',
        2: '- [Camera]: Allow only subtle, restrained camera movement.',
        3: '',
        4: '- [Camera]: Active camera movement. Use panning, tracking, and dolly techniques.',
        5: '- [Camera]: Highly dynamic camera work. Aggressively use handheld, drone shots, rapid zooms and rotations.',
      },
    },
    pacing: {
      ko: {
        1: '- [페이싱]: 하나의 길고 끊김 없는 롱테이크. 느리고 명상적인 호흡으로 전개할 것.',
        2: '- [페이싱]: 여유로운 전환. 컷을 최소화하고 천천히 진행할 것.',
        3: '',
        4: '- [페이싱]: 경쾌한 편집 리듬. 여러 컷으로 빠르게 장면을 전환할 것.',
        5: '- [페이싱]: 매우 빠른 컷 편집. 짧고 강렬한 숏들을 속사포처럼 연결할 것.',
      },
      en: {
        1: '- [Pacing]: A single long, uninterrupted take. Unfold slowly with a meditative rhythm.',
        2: '- [Pacing]: Relaxed transitions. Minimize cuts and progress slowly.',
        3: '',
        4: '- [Pacing]: Brisk editing rhythm. Switch scenes quickly across multiple cuts.',
        5: '- [Pacing]: Very fast cut editing. Chain short, intense shots in rapid succession.',
      },
    },
    realism: {
      ko: {
        1: '- [질감]: 실사 다큐멘터리 룩. 사실적인 광원과 자연스러운 물리 법칙을 따를 것.',
        2: '- [질감]: 사실적인 영상미를 기반으로 하되 약간의 영화적 보정을 허용할 것.',
        3: '',
        4: '- [질감]: 양식화된 영상미. CG/그래픽 요소를 가미한 스타일라이즈드 룩을 지향할 것.',
        5: '- [질감]: 완전한 애니메이션/CG 스타일. 비현실적 물리와 과장된 표현을 적극 활용할 것.',
      },
      en: {
        1: '- [Realism]: Live-action documentary look. Follow realistic lighting and natural physics.',
        2: '- [Realism]: Realistic cinematography with slight cinematic grading allowed.',
        3: '',
        4: '- [Realism]: Stylized look. Aim for a stylized aesthetic with CG/graphic elements.',
        5: '- [Realism]: Fully animated/CG style. Embrace unrealistic physics and exaggerated expression.',
      },
    },
    mood: {
      ko: {
        1: '- [분위기]: 차분하고 잔잔한 무드. 안정적이고 평온한 정서를 유지할 것.',
        2: '- [분위기]: 절제된 톤. 과하지 않은 은은한 정서를 표현할 것.',
        3: '',
        4: '- [분위기]: 감정적으로 고조된 무드. 긴장감이나 역동적인 에너지를 부여할 것.',
        5: '- [분위기]: 매우 강렬하고 극적인 무드. 폭발적인 감정과 압도적인 분위기를 연출할 것.',
      },
      en: {
        1: '- [Mood]: Calm, serene mood. Maintain a stable and peaceful emotion.',
        2: '- [Mood]: Restrained tone. Express subtle, understated emotion.',
        3: '',
        4: '- [Mood]: Emotionally heightened mood. Inject tension or dynamic energy.',
        5: '- [Mood]: Highly intense, dramatic mood. Stage explosive emotion and an overwhelming atmosphere.',
      },
    },
  },

  music: {
    tempo: {
      ko: {
        1: '- [템포]: 매우 느린 템포(약 60 BPM 이하). 늘어지고 여유로운 진행을 지향할 것.',
        2: '- [템포]: 느긋한 중저속 템포(약 70~90 BPM)를 유지할 것.',
        3: '',
        4: '- [템포]: 경쾌하고 빠른 템포(약 120~140 BPM)로 진행할 것.',
        5: '- [템포]: 매우 빠른 고속 템포(약 150 BPM 이상)로 질주하듯 진행할 것.',
      },
      en: {
        1: '- [Tempo]: Very slow tempo (~60 BPM or below). Aim for a stretched, relaxed progression.',
        2: '- [Tempo]: Easygoing mid-slow tempo (~70-90 BPM).',
        3: '',
        4: '- [Tempo]: Upbeat, fast tempo (~120-140 BPM).',
        5: '- [Tempo]: Very fast, driving tempo (~150 BPM or above).',
      },
    },
    energy: {
      ko: {
        1: '- [에너지]: 잔잔한 앰비언트. 거의 정적인 수준의 낮은 에너지를 유지할 것.',
        2: '- [에너지]: 차분하고 부드러운 에너지를 유지할 것.',
        3: '',
        4: '- [에너지]: 활기차고 힘 있는 에너지를 부여할 것.',
        5: '- [에너지]: 폭발적이고 강렬한 하이 에너지. 강한 비트와 다이내믹을 극대화할 것.',
      },
      en: {
        1: '- [Energy]: Gentle ambient. Keep near-static, low energy.',
        2: '- [Energy]: Calm, soft energy.',
        3: '',
        4: '- [Energy]: Lively, powerful energy.',
        5: '- [Energy]: Explosive, intense high energy. Maximize strong beats and dynamics.',
      },
    },
    instrumentation: {
      ko: {
        1: '- [편성]: 단일 악기 위주의 극도로 미니멀한 편성으로 구성할 것.',
        2: '- [편성]: 소수의 핵심 악기만으로 절제된 편성을 유지할 것.',
        3: '',
        4: '- [편성]: 다양한 악기를 겹쳐 풍성하고 입체적인 편성을 구성할 것.',
        5: '- [편성]: 오케스트라 수준의 웅장하고 화려한 풀 편성으로 구성할 것.',
      },
      en: {
        1: '- [Instrumentation]: Extremely minimal arrangement centered on a single instrument.',
        2: '- [Instrumentation]: Restrained arrangement with only a few core instruments.',
        3: '',
        4: '- [Instrumentation]: Layer diverse instruments for a rich, dimensional arrangement.',
        5: '- [Instrumentation]: Grand, lush full arrangement at orchestral scale.',
      },
    },
    genre: {
      ko: {
        1: '- [장르]: 정통적이고 클래식한 장르 관습을 충실히 따를 것.',
        2: '- [장르]: 표준적인 장르 문법을 유지하되 약간의 변주를 허용할 것.',
        3: '',
        4: '- [장르]: 여러 장르를 융합한 신선한 크로스오버를 시도할 것.',
        5: '- [장르]: 완전히 실험적이고 파격적인 장르 융합과 독창적 사운드를 추구할 것.',
      },
      en: {
        1: '- [Genre]: Faithfully follow traditional, classic genre conventions.',
        2: '- [Genre]: Keep standard genre grammar with slight variation allowed.',
        3: '',
        4: '- [Genre]: Attempt a fresh crossover fusing multiple genres.',
        5: '- [Genre]: Pursue fully experimental, boundary-breaking genre fusion and original sound.',
      },
    },
  },
};

// ── 모달리티 × 차원별 tier 레이블 (카드 상단 설명 생성용) ─────────────────────
type LabelMap = { ko: Record<number, string | null>; en: Record<number, string | null> };

const DIMENSION_LABELS: Record<Modality, Record<string, LabelMap>> = {
  text: {
    tone:       { ko: { 1: '극도 건조', 2: '격식체', 3: null, 4: '친근한 어투', 5: '유머러스' }, en: { 1: 'Ultra Dry', 2: 'Formal', 3: null, 4: 'Friendly', 5: 'Humorous' } },
    level:      { ko: { 1: '입문자용 어휘', 2: '초보자용 어휘', 3: null, 4: '전공자 어휘', 5: '최고 전문가 어휘' }, en: { 1: 'Beginner Vocab', 2: 'Introductory Vocab', 3: null, 4: 'Expert Vocab', 5: 'Top Specialist Vocab' } },
    density:    { ko: { 1: '초압축 요약', 2: '간략 설명', 3: null, 4: '상세 서술', 5: '극도 상세' }, en: { 1: 'Ultra Compact', 2: 'Brief', 3: null, 4: 'Detailed', 5: 'Exhaustive' } },
    creativity: { ko: { 1: '정석적 접근', 2: '표준 접근', 3: null, 4: '창의적 접근', 5: '파격적 접근' }, en: { 1: 'By-the-Book', 2: 'Standard', 3: null, 4: 'Creative', 5: 'Unconventional' } },
  },
  image: {
    style:    { ko: { 1: '포토리얼', 2: '사실적', 3: null, 4: '일러스트', 5: '추상/실험' }, en: { 1: 'Photoreal', 2: 'Realistic', 3: null, 4: 'Illustration', 5: 'Abstract' } },
    detail:   { ko: { 1: '미니멀', 2: '깔끔', 3: null, 4: '정교한 디테일', 5: '하이퍼디테일' }, en: { 1: 'Minimal', 2: 'Clean', 3: null, 4: 'Intricate', 5: 'Hyper-detailed' } },
    lighting: { ko: { 1: '평면 조명', 2: '자연광', 3: null, 4: '입체 조명', 5: '시네마틱 조명' }, en: { 1: 'Flat Light', 2: 'Natural Light', 3: null, 4: 'Dimensional', 5: 'Cinematic Light' } },
    color:    { ko: { 1: '모노톤', 2: '뮤트 톤', 3: null, 4: '선명한 색감', 5: '비비드' }, en: { 1: 'Monotone', 2: 'Muted', 3: null, 4: 'Vivid', 5: 'Neon Pop' } },
  },
  video: {
    camera:  { ko: { 1: '고정 샷', 2: '미세 무빙', 3: null, 4: '동적 무빙', 5: '역동 카메라' }, en: { 1: 'Fixed Shot', 2: 'Subtle Move', 3: null, 4: 'Dynamic Move', 5: 'Kinetic Camera' } },
    pacing:  { ko: { 1: '롱테이크', 2: '여유로운 전환', 3: null, 4: '경쾌한 편집', 5: '빠른 컷' }, en: { 1: 'Long Take', 2: 'Relaxed', 3: null, 4: 'Brisk Cuts', 5: 'Rapid Cuts' } },
    realism: { ko: { 1: '실사', 2: '영화적 실사', 3: null, 4: '스타일라이즈드', 5: 'CG/애니' }, en: { 1: 'Live-action', 2: 'Cinematic Real', 3: null, 4: 'Stylized', 5: 'CG/Anime' } },
    mood:    { ko: { 1: '잔잔한 무드', 2: '절제된 톤', 3: null, 4: '고조된 무드', 5: '극적 무드' }, en: { 1: 'Serene', 2: 'Restrained', 3: null, 4: 'Heightened', 5: 'Dramatic' } },
  },
  music: {
    tempo:           { ko: { 1: '매우 느림', 2: '중저속', 3: null, 4: '경쾌함', 5: '고속' }, en: { 1: 'Very Slow', 2: 'Mid-slow', 3: null, 4: 'Upbeat', 5: 'Fast' } },
    energy:          { ko: { 1: '앰비언트', 2: '차분함', 3: null, 4: '활기참', 5: '하이 에너지' }, en: { 1: 'Ambient', 2: 'Calm', 3: null, 4: 'Lively', 5: 'High Energy' } },
    instrumentation: { ko: { 1: '미니멀 편성', 2: '절제된 편성', 3: null, 4: '풍성한 편성', 5: '풀 오케스트라' }, en: { 1: 'Minimal', 2: 'Sparse', 3: null, 4: 'Rich', 5: 'Full Orchestra' } },
    genre:           { ko: { 1: '정통 장르', 2: '표준 장르', 3: null, 4: '크로스오버', 5: '실험적' }, en: { 1: 'Traditional', 2: 'Standard', 3: null, 4: 'Crossover', 5: 'Experimental' } },
  },
};

// ── tier 유틸 ─────────────────────────────────────────────────────────────────
function getTier(score: number): number {
  for (const { maxScore, tier } of TIER_THRESHOLDS) {
    if (score <= maxScore) return tier;
  }
  return MAX_TIER;
}

function shiftTier(tier: number, delta: number): number {
  return Math.min(MAX_TIER, Math.max(MIN_TIER, tier + delta));
}

function getSnippetByTier(tier: number, snippets: SnippetMap): string {
  return snippets[tier] ?? '';
}

type TierSet = Record<string, number>;

function buildTierDescription(modality: Modality, tiers: TierSet, language: 'ko' | 'en' = 'ko'): string {
  const labels = MODALITY_DIMENSIONS[modality]
    .map((dim) => DIMENSION_LABELS[modality][dim]?.[language]?.[tiers[dim]] ?? null)
    .filter((l): l is string => l !== null);
  return labels.length ? labels.join(' · ') : (language === 'en' ? 'Neutral' : '중립형');
}

function generateRandomVariantTiers(dims: string[], exactTiers: TierSet, exclude?: TierSet): TierSet {
  for (let i = 0; i < 15; i++) {
    const variant = {} as TierSet;
    for (const k of dims) {
      const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
      variant[k] = shiftTier(exactTiers[k], delta);
    }
    const diffFromExact = dims.some((k) => variant[k] !== exactTiers[k]);
    const diffFromExclude = !exclude || dims.some((k) => variant[k] !== exclude[k]);
    if (diffFromExact && diffFromExclude) return variant;
  }
  const fallback = { ...exactTiers };
  const k = dims[Math.floor(Math.random() * dims.length)];
  fallback[k] = shiftTier(exactTiers[k], exactTiers[k] < MAX_TIER ? 1 : -1);
  return fallback;
}

function buildConstraintSet(modality: Modality, tiers: TierSet, language: 'ko' | 'en' = 'ko'): string {
  const lines = MODALITY_DIMENSIONS[modality]
    .map((dim) => getSnippetByTier(tiers[dim], DIMENSION_SNIPPETS[modality][dim][language]))
    .filter(Boolean);
  const fallback = language === 'en'
    ? '(None — all dimensions neutral, target AI has full discretion)'
    : '(없음 — 전 항목 중립, 타겟 AI 자율)';
  return lines.length ? lines.join('\n') : fallback;
}

// ── 모달리티 자동 분류 ────────────────────────────────────────────────────────
const modalityClassificationSchema = z.object({
  modality: z.enum(['text', 'image', 'video', 'music']),
  reason: z.string(),
});

const CLASSIFY_SYSTEM_PROMPT = `You are a classifier that decides which kind of generative AI a user's rough draft is meant for.
Choose exactly one modality:
- "video": the draft asks to create/generate a video, clip, animation, film, or cinematic footage (e.g. "make a video of...", "영상 생성", "동영상", "클립").
- "image": the draft asks to create/generate an image, picture, illustration, photo, artwork, logo, or poster (e.g. "그림", "이미지", "일러스트", "사진", "포스터", "logo").
- "music": the draft asks to create/generate music, a song, BGM, melody, beat, or audio track (e.g. "노래", "BGM", "작곡", "멜로디", "track", "beat").
- "text": anything else — writing, explaining, summarizing, translating, coding, analysis, Q&A, etc. This is the default when intent is ambiguous.
Respond only via the structured schema.`;

async function classifyModality(draft: string): Promise<Modality> {
  try {
    const result = await generateText({
      model: anthropic('claude-haiku-4-5'),
      output: Output.object({ schema: modalityClassificationSchema }),
      system: CLASSIFY_SYSTEM_PROMPT,
      prompt: draft,
      temperature: 0, // 분류는 결정적이어야 하므로 온도 0
    });
    return result.output.modality as Modality;
  } catch (error) {
    console.error('Modality classification failed, defaulting to text:', error);
    return 'text';
  }
}

// ── 모달리티별 시스템 프롬프트 ────────────────────────────────────────────────
function buildTextSystemPrompt(language: 'ko' | 'en'): string {
  if (language === 'en') {
    return `# Role
You are a world-class B2B Prompt Engineer who perfectly controls target AIs (ChatGPT, Claude, etc.).

# Objective
Analyze the user's rough [Draft Prompt], combine it with the [Per-Candidate Constraints], and generate 3 highly structured prompt candidates (Markdown + XML tags) that the target AI can best read and execute.

# How to work (for EACH candidate)
1. First fill the 'approach' field: 1-2 sentences planning how you will design THIS candidate (a private design note, never shown to the user).
2. Then fill the 'content' field with the finished prompt.

# Required structure for 'content' (use Markdown + these XML tags)
- <Role>: One sentence defining the persona the target AI should adopt.
- <Context>: The background (job/purpose) and the situation inferred from the draft.
- <Task>: The core task for the target AI, as an explicit instruction that faithfully reflects the draft's intent.
- <Constraints>: List the [Per-Candidate Constraints] as rules the target AI must follow, plus the response-language directive (Rule 8).
- <OutputFormat>: Concretely specify the expected output shape (structure, length unit, headers, etc.).

# 🚨 Critical Rules
1. Style Separation: the prompt you generate is a dry instruction document for a machine (the target AI), not a beautifully written piece for a human.
2. Constraint Translation: do NOT apply the [Per-Candidate Constraints] to your own writing; insert them inside \`<Constraints>\` as explicit rules the target AI must follow.
3. Variable Orthogonality: explicitly state that each constraint operates independently (mutually exclusive). Expert vocabulary (Level) does not imply a serious Tone or a long response (Density).
4. Preserve Intent: never drop or arbitrarily generalize the concrete entities, proper nouns, numbers, or the core request found in the draft.
5. Baseline Quality: even when constraints are empty or neutral, always apply prompt-engineering best practices — a clear role, an explicit task, a defined output format, and removal of ambiguity.
6. Output Format Enforcement: respond only in the specified JSON format.
7. Output Language: write the 'content' of all 3 prompts in **English**.
8. Response Language Directive: inside every prompt's \`<Constraints>\`, include verbatim: "Respond in English."

# Generation Strategy
- Candidate 1 (Main): apply [Candidate 1 Constraints] only. Shown to the user first.
- Candidate 2 (Variant A): apply [Candidate 2 Constraints] only.
- Candidate 3 (Variant B): apply [Candidate 3 Constraints] only.
Each candidate follows only its own constraints and must be clearly distinct from the others.

# Example (skeleton reference for 'content' — adapt to the actual draft and constraints)
<Role>You are a senior IT product marketer with 10 years of experience.</Role>
<Context>The user is a SaaS startup marketer preparing a launch blog post for a new feature.</Context>
<Task>Based on the feature description below, draft the outline for the launch blog post: [feature description].</Task>
<Constraints>
- [Information Density]: summarize only the essentials in 3 bullet points or fewer.
- Respond in English.
- Each constraint applies independently.
</Constraints>
<OutputFormat>3-5 top-level sections as a numbered list.</OutputFormat>`;
  }

  return `# Role
당신은 타겟 AI(ChatGPT, Claude 등)를 완벽하게 통제하는 최고 수준의 'B2B 프롬프트 엔지니어'입니다.

# Objective
사용자가 입력한 거친 [초안 프롬프트]를 분석하고, [후보별 제약 조건]을 결합하여, 타겟 AI가 읽고 실행하기 가장 좋은 고도로 구조화된(마크다운 + XML 태그) 프롬프트 후보 3개를 생성하십시오.

# 작업 방식 (각 후보마다)
1. 먼저 'approach' 필드를 채우십시오: 이 후보를 어떻게 설계할지 1~2문장으로 계획합니다 (사용자에게 보이지 않는 설계 메모).
2. 그다음 'content' 필드에 완성된 프롬프트 전문을 작성하십시오.

# 'content' 필수 구조 (마크다운 + 아래 XML 태그 사용)
- <Role>: 타겟 AI가 맡을 역할/페르소나를 한 문장으로 정의.
- <Context>: 배경 맥락(직업/목적)과 초안에서 파악한 상황.
- <Task>: 타겟 AI가 수행할 핵심 작업을, 초안의 의도를 충실히 반영한 명시적 지시문으로.
- <Constraints>: [후보별 제약 조건]을 타겟 AI가 지켜야 할 규칙으로 나열 + 응답 언어 지시(Rule 8) 포함.
- <OutputFormat>: 기대 출력 형식(구조, 길이 단위, 머리말 등)을 구체적으로 명시.

# 🚨 Critical Rules (절대 규칙)
1. 문체 분리의 원칙: 당신이 생성하는 프롬프트는 인간이 읽는 예쁜 글이 아니라, 기계(타겟 AI)가 읽는 건조한 지시서입니다.
2. 제약 조건의 번역: [후보별 제약 조건]을 당신의 문체에 적용하지 말고, \`<Constraints>\` 안에 '타겟 AI가 지켜야 할 명시적 규칙'으로 삽입하십시오.
3. 변수 독립성(Orthogonality): 각 제약은 독립적으로 작동함을(상호 배제) 타겟 AI에게 명시하십시오. 전문적인 어휘(Level)가 진지한 어투(Tone)나 긴 글(Density)을 의미하지 않습니다.
4. 초안 의도 보존: 초안에 담긴 구체적 개체·고유명사·수치·핵심 요청을 절대 누락하거나 임의로 일반화하지 마십시오.
5. 기본 품질 보장: 제약 조건이 비어 있거나 중립이어도, 명확한 역할·명시적 작업·정의된 출력 형식·모호함 제거 같은 프롬프트 엔지니어링 베스트 프랙티스를 항상 적용하십시오.
6. 출력 형식 강제: 반드시 지정된 JSON 규격으로만 응답하십시오.
7. 출력 언어: 생성하는 3개 프롬프트의 content는 반드시 **한국어(Korean)**로 작성하십시오.
8. Response Language Directive: 모든 프롬프트의 \`<Constraints>\`에 "한국어로 응답하십시오. (Respond in Korean)"를 그대로 포함하십시오.

# Generation Strategy (후보군 3개 생성 전략)
- Candidate 1 (메인): [후보 1 제약 조건]만 적용. 이 후보가 사용자에게 가장 먼저 표시됩니다.
- Candidate 2 (변형 A): [후보 2 제약 조건]만 적용.
- Candidate 3 (변형 B): [후보 3 제약 조건]만 적용.
각 후보는 자신에게 할당된 제약 조건만 따르며, 서로 뚜렷이 구별되어야 합니다.

# 예시 (content 골격 참고용 — 실제 초안/제약에 맞게 변형할 것)
<Role>너는 10년차 IT 프로덕트 마케터다.</Role>
<Context>사용자는 SaaS 스타트업 마케터로, 신규 기능 출시 블로그 글을 준비 중이다.</Context>
<Task>아래 기능 설명을 바탕으로 출시 블로그 글의 목차를 작성하라: [기능 설명].</Task>
<Constraints>
- [정보 밀도]: 핵심만 3줄 이내의 개조식으로 요약할 것.
- 한국어로 응답하십시오. (Respond in Korean)
- 각 제약은 독립적으로 적용된다.
</Constraints>
<OutputFormat>최상위 목차 3~5개를 번호 매김 목록으로.</OutputFormat>`;
}

// example은 UI 언어와 무관하게 영어(미디어 도구가 가장 잘 이해하는 언어)로 둔다.
const MEDIA_GUIDE: Record<'image' | 'video' | 'music', { example: string; ko: { role: string; elements: string }; en: { role: string; elements: string } }> = {
  image: {
    example: 'A photorealistic close-up portrait of an elderly fisherman at golden hour, weathered skin texture, warm rim lighting, shallow depth of field, muted earthy palette, shot on 35mm, 3:2 aspect ratio.',
    ko: {
      role: '이미지 생성 AI(Midjourney, DALL·E, Stable Diffusion 등)',
      elements: '피사체(subject), 화풍/매체(style/medium), 구도(composition), 조명(lighting), 색감(color), 화질 묘사어(quality descriptors), 종횡비(aspect ratio)',
    },
    en: {
      role: 'image generation AIs (Midjourney, DALL·E, Stable Diffusion, etc.)',
      elements: 'subject, style/medium, composition, lighting, color, quality descriptors, aspect ratio',
    },
  },
  video: {
    example: 'Cinematic tracking shot following a lone cyclist down a misty mountain road at dawn, slow dolly movement, soft volumetric light, calm contemplative mood, live-action realism, 10s duration, 16:9 aspect ratio.',
    ko: {
      role: '영상 생성 AI(Sora, Runway, Veo, Kling 등)',
      elements: '장면(scene), 피사체와 동작(subject & action), 카메라 움직임/샷(camera movement/shot), 조명(lighting), 분위기(mood), 모션 다이내믹(motion dynamics), 스타일(style), 길이(duration), 종횡비(aspect ratio)',
    },
    en: {
      role: 'video generation AIs (Sora, Runway, Veo, Kling, etc.)',
      elements: 'scene, subject & action, camera movement/shot, lighting, mood, motion dynamics, style, duration, aspect ratio',
    },
  },
  music: {
    example: 'A warm lo-fi hip-hop track, around 80 BPM, mellow Rhodes piano with soft vinyl crackle, relaxed boom-bap drums, nostalgic late-night mood, instrumental, looping structure.',
    ko: {
      role: '음악 생성 AI(Suno, Udio 등)',
      elements: '장르(genre), 분위기(mood), 악기 편성(instrumentation), 템포/BPM(tempo), 곡 구조(structure), 보컬/연주 여부(vocal/instrumental)',
    },
    en: {
      role: 'music generation AIs (Suno, Udio, etc.)',
      elements: 'genre, mood, instrumentation, tempo/BPM, structure, vocal/instrumental',
    },
  },
};

function buildMediaSystemPrompt(language: 'ko' | 'en', modality: 'image' | 'video' | 'music'): string {
  const guide = MEDIA_GUIDE[modality][language];
  const example = MEDIA_GUIDE[modality].example;

  if (language === 'en') {
    return `# Role
You are a world-class Generative Media Prompt Engineer specializing in ${guide.role}.

# Objective
Analyze the user's rough [Draft Prompt], combine it with the [Per-Candidate Constraints], and generate 3 prompt candidates that can be pasted DIRECTLY into the target generative AI to produce the asset.

# How to work (for EACH candidate)
1. First fill the 'approach' field: 1-2 sentences planning how you will design THIS candidate (a private design note, never shown to the user).
2. Then fill the 'content' field with the ready-to-use descriptive prompt.

# 🚨 Critical Rules
1. Direct-Use Principle: the 'content' MUST be the descriptive generative prompt ITSELF — the visual/auditory description the target AI should create. It is NOT an instruction document telling another chatbot how to make/film/record the asset. Describe the final result, not the process.
2. No Meta-Wrapping: do NOT add conversational framing, "Respond in..." directives, or chat-style instructions. Output only the kind of richly descriptive prompt these tools expect.
3. Cover the Essentials: weave in the relevant elements naturally: ${guide.elements}.
4. Constraint Embodiment: bake the [Per-Candidate Constraints] directly into the descriptive wording.
5. Preserve Intent: never drop or arbitrarily generalize the concrete subject, named entities, or core idea from the draft.
6. Baseline Quality: even when constraints are empty or neutral, always produce a concrete, vivid, well-specified prompt (avoid vague one-liners).
7. Output Format Enforcement: respond only in the specified JSON format.
8. Output Language: write the 'content' of all 3 prompts in **English** (the language these tools understand best), even if the UI language differs.

# Generation Strategy
- Candidate 1 (Main): apply [Candidate 1 Constraints] only. Shown to the user first.
- Candidate 2 (Variant A): apply [Candidate 2 Constraints] only.
- Candidate 3 (Variant B): apply [Candidate 3 Constraints] only.
Each candidate is a distinct, ready-to-use prompt following only its own assigned constraints.

# Example (style reference for 'content' — adapt to the actual draft and constraints)
${example}`;
  }

  return `# Role
당신은 ${guide.role}를 전문으로 다루는 최고 수준의 '생성형 미디어 프롬프트 엔지니어'입니다.

# Objective
사용자가 입력한 거친 [초안 프롬프트]를 분석하고, [후보별 제약 조건]을 결합하여, 타겟 생성 AI에 **그대로 붙여넣으면 결과물이 바로 생성되는** 프롬프트 후보 3개를 생성하십시오.

# 작업 방식 (각 후보마다)
1. 먼저 'approach' 필드를 채우십시오: 이 후보를 어떻게 설계할지 1~2문장으로 계획합니다 (사용자에게 보이지 않는 설계 메모).
2. 그다음 'content' 필드에 즉시 사용 가능한 묘사형 프롬프트를 작성하십시오.

# 🚨 Critical Rules (절대 규칙)
1. 즉시 사용의 원칙: 'content'는 타겟 AI가 만들어 낼 결과물을 묘사하는 **'묘사형 생성 프롬프트 그 자체'**여야 합니다. 다른 챗봇에게 만드는/촬영하는/녹음하는 방법을 설명하는 지시서가 아닙니다. 제작 '과정'이 아니라 완성된 '결과물'을 묘사하십시오.
2. 메타 래핑 금지: 대화체 서두나 "~로 응답하십시오" 같은 지시, 챗봇식 안내를 추가하지 마십시오. 해당 도구가 기대하는 풍부한 묘사형 프롬프트만 출력하십시오.
3. 핵심 요소 포함: 다음 요소들을 자연스럽게 녹여내십시오: ${guide.elements}.
4. 제약 조건의 체화: [후보별 제약 조건]을 묘사형 표현 자체에 직접 반영하십시오.
5. 초안 의도 보존: 초안의 구체적 피사체·고유명사·핵심 아이디어를 누락하거나 임의로 일반화하지 마십시오.
6. 기본 품질 보장: 제약이 비어 있거나 중립이어도 구체적이고 생생하며 잘 명세된 프롬프트를 작성하십시오(막연한 한 줄 금지).
7. 출력 형식 강제: 반드시 지정된 JSON 규격으로만 응답해야 합니다.
8. 출력 언어: 생성하는 3개 프롬프트의 'content'는 (UI 언어와 무관하게) 영어(English)로 작성하십시오.

# Generation Strategy (후보군 3개 생성 전략)
- Candidate 1 (메인): [후보 1 제약 조건]만 적용. 사용자에게 가장 먼저 표시됩니다.
- Candidate 2 (변형 A): [후보 2 제약 조건]만 적용.
- Candidate 3 (변형 B): [후보 3 제약 조건]만 적용.
각 후보는 자신에게 할당된 제약만 따른, 서로 구별되는 즉시 사용 가능한 프롬프트여야 합니다.

# 예시 (content 스타일 참고용 — 실제 초안/제약에 맞게 변형할 것)
${example}`;
}

function buildStaticSystemPrompt(language: 'ko' | 'en', modality: Modality): string {
  if (modality === 'text') return buildTextSystemPrompt(language);
  return buildMediaSystemPrompt(language, modality);
}

// ── 동적 컨텍스트 조립 ────────────────────────────────────────────────────────
function buildDynamicContext(params: {
  job: string;
  purpose: string;
  draft: string;
  exactConstraints: string;
  variantAConstraints: string;
  variantBConstraints: string;
  language: 'ko' | 'en';
}): string {
  if (params.language === 'en') {
    return `# Context: User Data
- [Background Context]:
  - Job / Domain: ${params.job}
  - Primary Purpose: ${params.purpose}
- [Draft Prompt]: "${params.draft}"

# Per-Candidate Constraints
- [Candidate 1 Constraints (Exact User Preference)]:
${params.exactConstraints}

- [Candidate 2 Constraints (Variant A)]:
${params.variantAConstraints}

- [Candidate 3 Constraints (Variant B)]:
${params.variantBConstraints}`;
  }

  return `# Context: 사용자 데이터
- [배경 맥락 (Background Context)]:
  - 직업/도메인: ${params.job}
  - 사용 목적: ${params.purpose}
- [초안 프롬프트]: "${params.draft}"

# 후보별 제약 조건
- [후보 1 제약 조건 (사용자 선호 정확 반영)]:
${params.exactConstraints}

- [후보 2 제약 조건 (변형 A)]:
${params.variantAConstraints}

- [후보 3 제약 조건 (변형 B)]:
${params.variantBConstraints}`;
}

// ── 메인 서비스 함수 ──────────────────────────────────────────────────────────
export const generatePromptCandidates = async (
  requestData: GeneratePromptRequestType
) => {
  const { userId, originalInput, context, language = 'ko' } = requestData;
  const lang = language as 'ko' | 'en';

  // 0~1. 모달리티 분류 + 유저 프로필/가중치 조회를 병렬 실행.
  //   DB 조회는 userId만 사용해 modality 분류와 의존성이 없으므로 동시에 돌린다
  //   (분류용 Haiku 호출 1회 왕복만큼 지연 단축).
  const [modality, profileResult, prefsResult] = await Promise.all([
    classifyModality(originalInput),
    supabase
      .from('users')
      .select('job_role, primary_purpose')
      .eq('id', userId)
      .single(),
    supabase
      .from('user_preferences')
      .select('category, weight_score')
      .eq('user_id', userId),
  ]);
  const dims = MODALITY_DIMENSIONS[modality];

  const job = profileResult.data?.job_role ?? context?.domain ?? '명시되지 않음';
  const purpose = profileResult.data?.primary_purpose ?? '명시되지 않음';

  // user_preferences mapping — 현재 모달리티의 차원만, prefKey 규칙으로 매핑
  const prefs: Record<string, number> = {};
  for (const dim of dims) prefs[dim] = 1.0;

  if (prefsResult.data) {
    prefsResult.data.forEach((row) => {
      for (const dim of dims) {
        if (row.category === prefKey(modality, dim)) {
          prefs[dim] = row.weight_score;
        }
      }
    });
  }

  // 2. 가중치 → tier 변환 및 ±1 변형 설정
  const exactTiers: TierSet = {};
  for (const dim of dims) exactTiers[dim] = getTier(prefs[dim]);
  const variantATiers = generateRandomVariantTiers(dims, exactTiers);
  const variantBTiers = generateRandomVariantTiers(dims, exactTiers, variantATiers);

  // 3. 동적 컨텍스트 조립
  const dynamicContext = buildDynamicContext({
    job,
    purpose,
    draft: originalInput,
    exactConstraints: buildConstraintSet(modality, exactTiers, lang),
    variantAConstraints: buildConstraintSet(modality, variantATiers, lang),
    variantBConstraints: buildConstraintSet(modality, variantBTiers, lang),
    language: lang,
  });

  try {
    const result = await generateText({
      // 메인 생성은 품질이 핵심이므로 Sonnet 사용 (분류기는 Haiku 유지).
      model: anthropic('claude-sonnet-4-6'),
      output: Output.object({ schema: promptGenerationSchema }),
      system: buildStaticSystemPrompt(lang, modality),
      prompt: dynamicContext,
      temperature: 0.8,        // 후보 3종의 다양성 확보
      maxOutputTokens: 8192,   // 후보 3개 × (approach + 구조화 content) 잘림 방지
    });

    // 후보 개수 가드 — LLM이 정확히 3개를, 할당 순서대로 반환한다는 보장은 없다.
    //   slot(라벨+tierSet)을 단일 출처로 두고, 받은 후보 수만큼만 위치 기준으로 짝짓는다.
    //   · 0개: 보여줄 게 없으므로 에러로 처리해 사용자가 재시도하도록 한다.
    //   · 초과분(>3): 대응하는 slot이 없어 잘못된 메타데이터가 붙으므로 버린다.
    //   · 부족분(<3): 받은 만큼만 매핑. exact가 항상 첫 slot이라 가장 중요한 후보는 보존된다.
    const slots = [
      { variant: 'exact' as const, tiers: exactTiers },
      { variant: 'variant_a' as const, tiers: variantATiers },
      { variant: 'variant_b' as const, tiers: variantBTiers },
    ];

    const rawCandidates = result.output.candidates ?? [];
    if (rawCandidates.length === 0) {
      throw new Error('AI가 프롬프트 후보를 생성하지 못했습니다. 다시 시도해주세요.');
    }
    if (rawCandidates.length !== slots.length) {
      console.warn(
        `[generatePromptCandidates] Expected ${slots.length} candidates but got ${rawCandidates.length} ` +
        `(modality=${modality}); aligning to ${Math.min(rawCandidates.length, slots.length)} to keep tier metadata correct.`
      );
    }

    const candidates = slots.slice(0, rawCandidates.length).map((slot, i) => {
      const c = rawCandidates[i];
      // approach는 모델의 내부 설계 메모이므로 응답에서 제외하고 candidateId/content만 노출한다.
      return {
        candidateId: c.candidateId,
        content: c.content,
        metadata: {
          targetModality: modality,
          variant: slot.variant,
          appliedTiers: slot.tiers,
          tierDescription: buildTierDescription(modality, slot.tiers, lang),
        },
      };
    });

    // DB에 후보군 개별 삽입
    const sessionId = randomUUID();
    const insertPayloads = candidates.map((c) => ({
      session_id: sessionId,
      user_id: userId,
      original_input: originalInput,
      chosen_prompt: c.content,
      chosen_metadata: c.metadata,
      applied_context: c.metadata.appliedTiers || {},
      is_liked: false,
      is_weight_applied: false
    }));

    const { data: insertedLogs, error: insertError } = await supabase
      .from('prompt_logs')
      .insert(insertPayloads)
      .select('id, chosen_metadata');

    if (insertError) {
      console.error('Error inserting prompt_logs:', insertError);
      throw new Error('프롬프트 로그 저장 중 오류가 발생했습니다.');
    }

    // 삽입된 log_id 매핑
    const finalCandidates = candidates.map((c) => {
      const logId = insertedLogs?.find((l) => l.chosen_metadata.variant === c.metadata.variant)?.id;
      return { ...c, logId };
    });

    return {
      requestId: randomUUID(),
      candidates: finalCandidates,
    };
  } catch (error) {
    console.error('Error generating prompts via AI SDK:', error);
    if (error instanceof Error) throw error;
    throw new Error('프롬프트 생성 중 오류가 발생했습니다.');
  }
};
