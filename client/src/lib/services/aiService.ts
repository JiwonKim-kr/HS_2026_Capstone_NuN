import { anthropic } from '@ai-sdk/anthropic';
import { generateText, Output } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { GeneratePromptRequestType, generatePromptResponseSchema, aiOutputSchema } from '@/lib/schemas/promptSchema';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── 가중치 임계값 → 지시문 스니펫 매핑 (information.md Section 2~3) ──────────
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

// ── 언어별 스니펫 맵 ──────────────────────────────────────────────────────────
type LangSnippetMap = { ko: SnippetMap; en: SnippetMap };

const TONE_SNIPPETS: LangSnippetMap = {
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
};

const LEVEL_SNIPPETS: LangSnippetMap = {
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
};

const DENSITY_SNIPPETS: LangSnippetMap = {
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
};

const CREATIVITY_SNIPPETS: LangSnippetMap = {
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
};

// ── 티어 조작 유틸 함수 ───────────────────────────────────────────────────────
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

type TierSet = { tone: number; level: number; density: number; creativity: number };

// ── 언어별 티어 레이블 (카드 상단 설명 생성용) ───────────────────────────────
type TierLabelMap = Record<keyof TierSet, Record<number, string | null>>;

const TIER_LABELS: { ko: TierLabelMap; en: TierLabelMap } = {
  ko: {
    tone:       { 1: '극도 건조', 2: '격식체', 3: null, 4: '친근한 어투', 5: '유머러스' },
    level:      { 1: '입문자용 어휘', 2: '초보자용 어휘', 3: null, 4: '전공자 어휘', 5: '최고 전문가 어휘' },
    density:    { 1: '초압축 요약', 2: '간략 설명', 3: null, 4: '상세 서술', 5: '극도 상세' },
    creativity: { 1: '정석적 접근', 2: '표준 접근', 3: null, 4: '창의적 접근', 5: '파격적 접근' },
  },
  en: {
    tone:       { 1: 'Ultra Dry', 2: 'Formal', 3: null, 4: 'Friendly', 5: 'Humorous' },
    level:      { 1: 'Beginner Vocab', 2: 'Introductory Vocab', 3: null, 4: 'Expert Vocab', 5: 'Top Specialist Vocab' },
    density:    { 1: 'Ultra Compact', 2: 'Brief', 3: null, 4: 'Detailed', 5: 'Exhaustive' },
    creativity: { 1: 'By-the-Book', 2: 'Standard', 3: null, 4: 'Creative', 5: 'Unconventional' },
  },
};

function buildTierDescription(tiers: TierSet, language: 'ko' | 'en' = 'ko'): string {
  const labels = (Object.keys(TIER_LABELS.ko) as (keyof TierSet)[])
    .map(k => TIER_LABELS[language][k][tiers[k]] ?? null)
    .filter((l): l is string => l !== null);
  return labels.length ? labels.join(' · ') : (language === 'en' ? 'Neutral' : '중립형');
}

function generateRandomVariantTiers(exactTiers: TierSet, exclude?: TierSet): TierSet {
  const keys: (keyof TierSet)[] = ['tone', 'level', 'density', 'creativity'];
  for (let i = 0; i < 15; i++) {
    const variant = {} as TierSet;
    for (const k of keys) {
      const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
      variant[k] = shiftTier(exactTiers[k], delta);
    }
    const diffFromExact = keys.some(k => variant[k] !== exactTiers[k]);
    const diffFromExclude = !exclude || keys.some(k => variant[k] !== exclude[k]);
    if (diffFromExact && diffFromExclude) return variant;
  }
  // 폴백: 한 차원이라도 반드시 exact와 다르게 강제
  const fallback = { ...exactTiers };
  const k = keys[Math.floor(Math.random() * keys.length)];
  fallback[k] = shiftTier(exactTiers[k], exactTiers[k] < MAX_TIER ? 1 : -1);
  return fallback;
}

function buildConstraintSet(tiers: TierSet, language: 'ko' | 'en' = 'ko'): string {
  const lines = [
    getSnippetByTier(tiers.tone, TONE_SNIPPETS[language]),
    getSnippetByTier(tiers.level, LEVEL_SNIPPETS[language]),
    getSnippetByTier(tiers.density, DENSITY_SNIPPETS[language]),
    getSnippetByTier(tiers.creativity, CREATIVITY_SNIPPETS[language]),
  ].filter(Boolean);
  const fallback = language === 'en'
    ? '(None — all dimensions neutral, target AI has full discretion)'
    : '(없음 — 전 항목 중립, 타겟 AI 자율)';
  return lines.length ? lines.join('\n') : fallback;
}

// ── 정적 시스템 프롬프트 골격 (언어 파라미터를 받아 동적 조립) ────────────────
function buildStaticSystemPrompt(language: 'ko' | 'en' = 'ko'): string {
  if (language === 'en') {
    return `# Role
You are a world-class Prompt Engineer. Your sole job is to craft optimized **input prompts** that users will paste into AI tools — you do NOT produce the final content or output yourself.

# Objective
Take the user's rough [Draft Prompt] and transform it into 3 polished, ready-to-use **prompt candidates** that a user can directly paste into a target AI tool to get the best possible result.

⚠️ CRITICAL DISTINCTION — What you produce vs. what you must NOT produce:
- ✅ You PRODUCE: An optimized PROMPT (instruction text) the user will feed INTO a target AI tool.
- ❌ You must NOT produce: The actual final content/output itself (e.g., do not write the video, do not write the essay, do not generate the image description as if it were the output).
- Example (Video AI): If the user wants a video about "a sunset over mountains," you write a VIDEO GENERATION PROMPT to paste into Sora/Runway — NOT a description of what the video looks like.
- Example (LLM): If the user wants help writing an email, you write a PROMPT to paste into ChatGPT — NOT the email itself.

# Step 1: Purpose Detection
Before generating any prompts, carefully analyze the [Draft Prompt] to determine what type of AI tool the user is targeting.

Detection criteria — select the single most fitting category:
- **Text Generation AI (LLM)**: Writing, summarization, analysis, coding, Q&A, or other text-based tasks (e.g., ChatGPT, Claude, Gemini)
- **Image Generation AI**: Visual image creation (e.g., Midjourney, DALL-E, Stable Diffusion, Firefly)
- **Video Generation AI**: Video or motion content creation (e.g., Sora, Runway, Pika, Kling, Hailuo)
- **Music / Voice AI**: Audio content generation (e.g., Suno, ElevenLabs, Udio)
- **Other Specialized AI**: Code execution, data analysis, or other purpose-specific tools

# Step 2: Format Adaptation
Based on the detected purpose, craft the PROMPT in the input format that the target AI tool expects. Remember: you are writing a PROMPT for that AI, not producing the content itself.

- **Text Generation AI**: Structured instruction document using Markdown and XML tags (\`<Role>\`, \`<Objective>\`, \`<Constraints>\`, etc.) — the PROMPT the user pastes into the LLM
- **Image Generation AI**: Comma-separated visual keyword string — subject, art style, lighting, color palette, composition, quality boosters (e.g., "8K", "hyperrealistic") — the PROMPT the user pastes into the image generator
- **Video Generation AI**: Concise natural-language scene description the VIDEO AI will use as its generation directive. Include: subject/action, camera movement (pan, zoom, dolly, tracking shot, etc.), mood/color tone, duration cues. Do NOT use Markdown headings or XML tags. Do NOT describe the video as if narrating what it shows — write as a generation instruction.
- **Music / Voice AI**: Comma-separated or brief natural-language prompt specifying genre, BPM/tempo, mood, key instruments, vocal style, sound texture — the PROMPT the user pastes into the music generator
- **Other**: The prompt format best optimized for the target tool's specific input specification

# 🚨 Critical Rules
1. **Purpose-First Principle**: The format and structure of every generated prompt MUST be determined by the detected target AI type. If intent is ambiguous, infer the most likely purpose from the draft and commit to it.
2. **Prompt-Only Output**: Every generated candidate must be a PROMPT (instruction) to be pasted into an AI tool — never the final content or output itself.
3. **Adaptive Constraint Interpretation**: The [Dynamic Constraints] below represent the user's preferences (tone, level, density, creativity). Re-interpret and apply them to suit the detected AI type. Examples: for Video AI — 'density' maps to number of scenes & layers of visual detail; 'tone' maps to visual mood & atmosphere; 'creativity' maps to experimental composition & cinematography choices.
4. **Output Format Enforcement**: You MUST respond only in the specified JSON format.
5. **Output Language**: Write the body content (content) of all 3 generated prompts in **English**.
6. **Response Language Directive (LLM only)**: This rule applies ONLY when the detected target is a **Text Generation AI (LLM)**. In that case, you MUST include the following instruction verbatim inside the \`<Constraints>\` section of every generated prompt: "Respond in English." — For all other target AI types (Image, Video, Music, etc.), do NOT add any response language directive, as it is not applicable.

# Generation Strategy
⚠️ CRITICAL: You MUST generate EXACTLY 3 prompt candidates in the 'candidates' array. Generating fewer than 3 is a failure.
Generate 3 prompts by applying the constraints below exactly to each candidate.
- Candidate 1 (Main): Apply [Candidate 1 Constraints] only. This candidate is shown to the user first.
- Candidate 2 (Variant A): Apply [Candidate 2 Constraints] only.
- Candidate 3 (Variant B): Apply [Candidate 3 Constraints] only.
Each candidate must strictly follow only its own assigned constraints and must not mix constraints from other candidates.`;
  }

  // 한국어 모드
  return `# Role
당신은 최고 수준의 '프롬프트 엔지니어'입니다. 당신의 역할은 사용자가 AI 도구에 입력할 **최적화된 프롬프트(지시문)**를 작성하는 것입니다. 당신이 직접 콘텐츠나 최종 결과물을 생성하는 것이 아닙니다.

# Objective
사용자가 입력한 거친 [초안 프롬프트]를 분석하고, 사용자가 타겟 AI 도구에 직접 붙여 넣어 최상의 결과를 얻을 수 있도록 고도화된 **프롬프트 후보 3개**를 생성하십시오.

⚠️ 핵심 구분 — 당신이 생성해야 하는 것 vs. 생성해서는 안 되는 것:
- ✅ 생성해야 하는 것: 사용자가 타겟 AI 도구에 '입력'할 최적화된 프롬프트(지시문) 그 자체
- ❌ 생성해서는 안 되는 것: 최종 결과물(콘텐츠) 자체 (예: 영상의 내용을 직접 쓰거나, 에세이를 직접 작성하거나, 이미지를 묘사한 결과물을 출력하는 것)
- 예시 (영상 AI): 사용자가 "산 위의 일몰 영상"을 원한다면, Sora/Runway에 붙여 넣을 영상 생성 프롬프트를 작성해야 합니다. 영상의 내용을 묘사하는 글을 쓰면 안 됩니다.
- 예시 (LLM): 사용자가 이메일 작성 도움을 원한다면, ChatGPT에 붙여 넣을 프롬프트를 작성해야 합니다. 이메일 자체를 작성하면 안 됩니다.

# Step 1: 사용 목적 분석 (Purpose Detection)
프롬프트를 생성하기 전, 반드시 [초안 프롬프트]를 분석하여 사용자가 어떤 종류의 AI 도구를 위한 프롬프트를 원하는지 파악하십시오.

판단 기준 (아래 유형 중 가장 적합한 하나를 선택):
- **텍스트 생성 AI (LLM)**: 글쓰기, 요약, 분석, 코딩, 질의응답 등 텍스트 기반 작업 (예: ChatGPT, Claude, Gemini)
- **이미지 생성 AI**: 시각적 이미지 생성 (예: Midjourney, DALL-E, Stable Diffusion, Firefly)
- **영상 생성 AI**: 동영상·모션 콘텐츠 생성 (예: Sora, Runway, Pika, Kling, Hailuo)
- **음악/음성 AI**: 오디오 콘텐츠 생성 (예: Suno, ElevenLabs, Udio)
- **기타 전문 AI**: 코드 실행, 데이터 분석 등 특수 목적 도구

# Step 2: 목적에 맞는 형식으로 프롬프트 작성 (Format Adaptation)
감지된 사용 목적에 따라 해당 AI가 가장 잘 이해하고 실행할 수 있는 형식으로 프롬프트를 작성하십시오. 이 프롬프트는 사용자가 타겟 AI에 직접 붙여 넣을 지시문입니다. 콘텐츠 자체가 아닌 '지시문'을 작성하는 것임을 명심하십시오.

- **텍스트 생성 AI**: 마크다운 및 XML 태그(\`<Role>\`, \`<Objective>\`, \`<Constraints>\` 등)로 구조화된 지시서 형태 — 사용자가 LLM에 붙여 넣을 프롬프트
- **이미지 생성 AI**: 피사체·아트 스타일·조명·색감·구도·품질 부스터("8K", "hyperrealistic" 등) 중심의 쉼표로 구분된 키워드 나열 — 사용자가 이미지 생성기에 붙여 넣을 프롬프트
- **영상 생성 AI**: 영상 AI가 영상 생성 지시로 해석할 수 있는 간결한 자연어 서술. 피사체/행동, 카메라 움직임(pan, zoom, dolly, tracking shot 등), 분위기·색조, 시간 정보를 포함할 것. 마크다운 제목이나 XML 태그를 사용하지 말 것. 영상의 내용을 내레이션하듯 묘사하지 말고, 생성 지시 형태로 작성할 것.
- **음악/음성 AI**: 장르·템포(BPM)·분위기·악기·보컬 스타일·음향 질감 등 오디오 속성 중심 — 사용자가 음악 생성기에 붙여 넣을 프롬프트
- **기타**: 해당 도구의 입력 규격에 최적화된 형식

# 🚨 Critical Rules (절대 규칙)
1. **목적 우선의 원칙**: 프롬프트의 형식과 구조는 반드시 감지된 타겟 AI 유형에 맞게 결정되어야 합니다. 의도가 불명확할 경우, 초안에서 가장 유력한 목적을 추론하여 확정하십시오.
2. **프롬프트 전용 출력**: 생성하는 모든 후보는 타겟 AI에 입력할 프롬프트(지시문)여야 합니다. 최종 콘텐츠나 결과물 자체를 직접 생성하는 것은 절대 금지입니다.
3. **제약 조건의 적응적 해석**: 아래 [동적 제약 조건]은 사용자의 선호(어투, 수준, 밀도, 창의성)를 나타냅니다. 이를 감지된 AI 유형에 맞게 재해석하여 프롬프트에 반영하십시오. (예: 영상 AI의 경우 — '밀도'→장면 수·시각적 디테일 레이어, '어투'→영상의 분위기·무드, '창의성'→구도·연출의 실험성)
4. **출력 형식 강제**: 반드시 지정된 JSON 규격으로만 응답해야 합니다.
5. **출력 언어**: 생성하는 3개의 프롬프트 본문 내용(content)은 사용자 인터페이스 언어에 맞게 반드시 **한국어(Korean)**로 작성하십시오.
6. **Response Language Directive (LLM 전용)**: 이 규칙은 Step 1에서 타겟 AI가 **텍스트 생성 AI (LLM)**으로 판별된 경우에만 적용됩니다. 해당 경우에는 생성하는 모든 프롬프트의 \`<Constraints>\` 섹션 안에 다음 문구를 반드시 포함하십시오: "한국어로 응답하십시오. (Respond in Korean)" — 이미지, 영상, 음악 등 다른 유형의 AI가 타겟인 경우에는 이 문구를 삽입하지 마십시오. 해당 AI에는 적용되지 않습니다.

# Generation Strategy (후보군 3개 생성 전략)
⚠️ 절대 규칙: 'candidates' 배열에 반드시 정확히 3개의 후보를 생성해야 합니다. 3개 미만은 오류입니다.
아래 [후보별 제약 조건]을 각 후보에 정확히 적용하여 프롬프트 3개를 생성하십시오.
- Candidate 1 (메인): [후보 1 제약 조건]만 적용. 이 후보가 사용자에게 가장 먼저 표시됩니다.
- Candidate 2 (변형 A): [후보 2 제약 조건]만 적용.
- Candidate 3 (변형 B): [후보 3 제약 조건]만 적용.
각 후보는 반드시 자신에게 할당된 제약 조건만을 따르고, 다른 후보의 제약 조건과 혼합하지 마십시오.`;
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

  // 1. Supabase에서 유저 프로필 + 가중치 병렬 조회
  const [profileResult, prefsResult] = await Promise.all([
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

  const notSpecified = language === 'en' ? 'Not specified' : '명시되지 않음';
  const job = profileResult.data?.job_role ?? context?.domain ?? notSpecified;
  const purpose = profileResult.data?.primary_purpose ?? notSpecified;

  // user_preferences mapping
  const defaultPrefs = { tone: 1.0, level: 1.0, density: 1.0, creativity: 1.0 };
  const prefs = { ...defaultPrefs };

  if (prefsResult.data) {
    prefsResult.data.forEach((row) => {
      if (row.category && row.category in prefs) {
        prefs[row.category as keyof typeof prefs] = row.weight_score;
      }
    });
  }

  // 2. 가중치 → 스니펫 변환 및 ±1 티어 설정
  const exactTiers: TierSet = {
    tone: getTier(prefs.tone),
    level: getTier(prefs.level),
    density: getTier(prefs.density),
    creativity: getTier(prefs.creativity),
  };
  const variantATiers = generateRandomVariantTiers(exactTiers);
  const variantBTiers = generateRandomVariantTiers(exactTiers, variantATiers);

  // 3. 동적 컨텍스트 조립
  const dynamicContext = buildDynamicContext({
    job,
    purpose,
    draft: originalInput,
    exactConstraints: buildConstraintSet(exactTiers, language as 'ko' | 'en'),
    variantAConstraints: buildConstraintSet(variantATiers, language as 'ko' | 'en'),
    variantBConstraints: buildConstraintSet(variantBTiers, language as 'ko' | 'en'),
    language: language as 'ko' | 'en',
  });

  try {
    const result = await generateText({
      model: anthropic('claude-haiku-4-5'),
      output: Output.object({ schema: aiOutputSchema }),
      system: buildStaticSystemPrompt(language as 'ko' | 'en'),
      prompt: dynamicContext,
    });

    const variantLabels = ['exact', 'variant_a', 'variant_b'] as const;
    const tierSets = [exactTiers, variantATiers, variantBTiers];

    const candidates = result.output.candidates.map((c, i) => ({
      ...c,
      metadata: {
        ...c.metadata,
        variant: variantLabels[i] ?? 'exact',
        appliedTiers: tierSets[i] ?? exactTiers,
        tierDescription: buildTierDescription(tierSets[i] ?? exactTiers, language as 'ko' | 'en'),
      },
    }));

    // DB에 3개 후보군 개별 삽입
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
