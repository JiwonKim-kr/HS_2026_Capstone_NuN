import { anthropic } from '@ai-sdk/anthropic';
import { generateText, Output } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { GeneratePromptRequestType, generatePromptResponseSchema } from '../schemas/promptSchema';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── 가중치 임계값 → 지시문 스니펫 매핑 (information.md Section 2~3) ──────────
// snippets 순서: [tier1, tier2, tier4, tier5] — tier3은 항상 "" (토큰 절약)
type SnippetTuple = [string, string, string, string];

function mapToSnippet(score: number, snippets: SnippetTuple): string {
  if (score <= 0.5) return snippets[0];
  if (score <= 0.8) return snippets[1];
  if (score < 1.2)  return '';
  if (score < 1.5)  return snippets[2];
  return snippets[3];
}

const TONE_SNIPPETS: SnippetTuple = [
  '- [어투]: 감정과 수식어를 완전히 배제하고, 가장 건조하고 객관적인 문체(하다체)로 작성할 것.',
  '- [어투]: 감정 표현을 자제하고, 정중하고 격식 있는 비즈니스 톤(하십시오체)을 유지할 것.',
  '- [어투]: 친근하고 대화하는 듯한 부드러운 어투를 사용하며, 가벼운 감정 표현이나 공감을 포함할 것.',
  '- [어투]: 매우 유머러스하고 재치 있는 어투를 사용하며, 상황에 맞는 이모지와 밈(Meme)을 적극적으로 활용할 것.',
];

const LEVEL_SNIPPETS: SnippetTuple = [
  '- [어휘 수준]: 타겟 독자는 해당 지식이 전혀 없는 초보자입니다. 전문 용어를 철저히 배제하고 상위 1,000개 이내의 쉬운 일상 단어로만 설명할 것.',
  '- [어휘 수준]: 타겟 독자는 입문자입니다. 기초 개념 위주로 서술하되, 불가피한 전문 용어 사용 시 반드시 뜻을 풀이할 것.',
  '- [어휘 수준]: 타겟 독자는 관련 전공자/실무자입니다. 업계 표준 용어, 약어, 그리고 실무적인 개념을 주저 없이 사용할 것.',
  '- [어휘 수준]: 타겟 독자는 해당 분야의 시니어/최고 전문가입니다. 논문 수준의 심층 어휘를 사용하고, 필요시 권위 있는 출처나 원리를 인용할 것.',
];

const DENSITY_SNIPPETS: SnippetTuple = [
  '- [정보 밀도]: 부연 설명을 모두 생략하고, 핵심만 3줄 이내의 개조식(Bullet points)으로 극도로 요약할 것.',
  '- [정보 밀도]: 주요 특징만 간략히 나열하며, 불필요한 예시나 장황한 배경 설명은 제외할 것.',
  '- [정보 밀도]: 하위 목차를 세분화하여 구조적으로 서술하고, 다양한 엣지 케이스와 구체적인 예시를 3개 이상 다룰 것.',
  '- [정보 밀도]: 가능한 모든 세부 정보, 작동 원리, 예외 상황, 역사적 배경 등을 TMI 수준으로 촘촘하고 매우 길게 서술할 것.',
];

const CREATIVITY_SNIPPETS: SnippetTuple = [
  '- [창의성]: 가장 널리 검증되고 정석적인 단일 해결책이나 교과서적인 정의만 정확하게 제시할 것.',
  '- [창의성]: 표준적인 접근을 유지하되, 약간의 실무적 팁이나 대중적인 비유를 한 가지 정도 곁들일 것.',
  '- [창의성]: 기존의 틀을 깨는 참신한 시각과 독창적인 비유를 활용하여 다각도에서 아이디어를 확장할 것.',
  '- [창의성]: 완전히 파격적이고 도발적인 접근법을 포함하며, 이질적인 개념들을 융합한 브레인스토밍 결과를 제시할 것.',
];

// ── 정적 시스템 프롬프트 골격 (Prompt Caching 대상) ─────────────────────────
const STATIC_SYSTEM_PROMPT = `# Role
당신은 타겟 AI(ChatGPT, Claude 등)를 완벽하게 통제하는 최고 수준의 'B2B 프롬프트 엔지니어'입니다.

# Objective
사용자가 입력한 거친 [초안 프롬프트]를 분석하고, 사용자의 취향을 반영한 [동적 제약 조건]을 결합하여, 타겟 AI가 읽고 실행하기 가장 좋은 고도로 구조화된(마크다운 및 XML 태그 활용) 프롬프트 후보군 3개를 생성하십시오.

# 🚨 Critical Rules (절대 규칙)
1. 문체 분리의 원칙: 당신이 생성해 내는 프롬프트 문장 자체는 인간이 읽기 좋은 예쁜 글이 아니라, 기계(타겟 AI)가 읽기 좋은 건조하고 분석적인 지시서여야 합니다.
2. 제약 조건의 번역: 아래 제공되는 [동적 제약 조건]을 당신의 문체에 적용하지 마십시오. 이 조건들은 당신이 생성하는 프롬프트 내부의 \`<Constraints>\` 태그 안에 '타겟 AI가 지켜야 할 명시적 규칙'으로 삽입되어야 합니다.
3. 변수 독립성(Orthogonality) 유지: 당신이 생성하는 프롬프트 내부의 각 제약 조건은 철저하게 독립적으로 작동해야 한다고 타겟 AI에게 명시하십시오. 전문적인 어휘(Level)가 진지한 어투(Tone)나 긴 글(Density)을 의미하지 않으며, 각 속성은 서로 침범하지 않는다는 상호 배제(Mutually Exclusive) 원칙을 포함하십시오.
4. 출력 형식 강제: 반드시 지정된 JSON 규격으로만 응답해야 합니다.

# Generation Strategy (후보군 3개 생성 전략)
사용자가 다양한 접근 방식을 선택할 수 있도록, 3개의 각기 다른 프롬프트를 생성하십시오. (3개 모두 위 [동적 제약 조건]은 반드시 포함해야 합니다.)
- Candidate 1 (정석적 최적화): [초안 프롬프트]의 핵심 의도를 깔끔하게 구조화한 형태.
- Candidate 2 (포맷/구조 강화): 타겟 AI가 마크다운 구조, 표(Table), 단계별(Step-by-Step) 출력 등을 사용하도록 지시하여 시각적 가독성을 극대화한 형태.
- Candidate 3 (창의적 페르소나): 타겟 AI에게 매우 독특한 페르소나를 부여하여 색다른 관점을 이끌어내는 형태.`;

// ── 동적 컨텍스트 조립 ────────────────────────────────────────────────────────
function buildDynamicContext(params: {
  job: string;
  purpose: string;
  draft: string;
  toneSnippet: string;
  levelSnippet: string;
  densitySnippet: string;
  creativitySnippet: string;
}): string {
  const constraints = [
    params.toneSnippet,
    params.levelSnippet,
    params.densitySnippet,
    params.creativitySnippet,
  ]
    .filter(Boolean)
    .join('\n');

  return `# Context: 사용자 데이터
- [배경 맥락 (Background Context)]:
  - 직업/도메인: ${params.job}
  - 사용 목적: ${params.purpose}
- [초안 프롬프트]: "${params.draft}"

- [동적 제약 조건 (타겟 AI에게 강제할 지시문)]:
${constraints || '(없음 — 중립값, 타겟 AI 자율에 맡김)'}`;
}

// ── 메인 서비스 함수 ──────────────────────────────────────────────────────────
export const generatePromptCandidates = async (
  requestData: GeneratePromptRequestType
) => {
  const { userId, originalInput, context } = requestData;

  // 1. Supabase에서 유저 프로필 + 가중치 병렬 조회
  const [profileResult, prefsResult] = await Promise.all([
    supabase
      .from('users')
      .select('job_role, primary_purpose')
      .eq('id', userId)
      .single(),
    supabase
      .from('user_preferences')
      .select('tone, level, density, creativity')
      .eq('user_id', userId)
      .single(),
  ]);

  const job     = profileResult.data?.job_role       ?? context?.domain ?? '명시되지 않음';
  const purpose = profileResult.data?.primary_purpose ?? '명시되지 않음';

  // user_preferences 없으면 전부 1.0 (중립 → 빈 스니펫)
  const prefs = prefsResult.data ?? { tone: 1.0, level: 1.0, density: 1.0, creativity: 1.0 };

  // 2. 가중치 → 스니펫 변환
  const toneSnippet       = mapToSnippet(prefs.tone,       TONE_SNIPPETS);
  const levelSnippet      = mapToSnippet(prefs.level,      LEVEL_SNIPPETS);
  const densitySnippet    = mapToSnippet(prefs.density,    DENSITY_SNIPPETS);
  const creativitySnippet = mapToSnippet(prefs.creativity, CREATIVITY_SNIPPETS);

  // 3. 동적 컨텍스트 조립
  const dynamicContext = buildDynamicContext({
    job,
    purpose,
    draft: originalInput,
    toneSnippet,
    levelSnippet,
    densitySnippet,
    creativitySnippet,
  });

  try {
    const result = await generateText({
      model: anthropic('claude-haiku-4-5'),
      output: Output.object({ schema: generatePromptResponseSchema }),
      system: STATIC_SYSTEM_PROMPT,
      prompt: dynamicContext,
    });

    return {
      ...result.output,
      requestId: randomUUID(),
    };
  } catch (error) {
    console.error('Error generating prompts via AI SDK:', error);
    if (error instanceof Error) throw error;
    throw new Error('프롬프트 생성 중 오류가 발생했습니다.');
  }
};
