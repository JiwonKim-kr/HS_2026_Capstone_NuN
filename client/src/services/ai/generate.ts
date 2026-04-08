import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { generatePromptResponseSchema, GeneratePromptRequestType } from '@/schemas/promptSchema';

/**
 * Zod 스키마에 맞춰 최적화된 프롬프트를 생성하는 AI 서비스 함수
 * @param requestData 프롬프트 생성 요청 데이터
 */
export async function generateOptimizedPrompt(requestData: GeneratePromptRequestType) {
  const { userId, originalInput, context } = requestData;
  const domain = context?.domain || '명시되지 않음';

  // 시스템과 사용자 프롬프트 구성
  const systemPrompt = `당신은 세계 최고 수준의 프롬프트 엔지니어입니다.
사용자가 제안한 초안 내용(originalInput)을 바탕으로 완벽하게 동작하고 상세한 프롬프트를 설계해 주는 것이 목표입니다.
반드시 제공된 JSON 스키마 형식에 맞게 응답해야 합니다.`;

  const userPrompt = `
다음 정보를 바탕으로 최적화된 프롬프트를 생성해 주세요:
- 사용자 초안 내용: ${originalInput}
- 목적/도메인(Context): ${domain}

사용자의 초안 의도를 분석하여, 즉시 활용 가능한 최적의 프롬프트 후보군들을 생성해 주세요.
  `;

  try {
    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-20240620'), // 최신 (지원하는) 안정버전 모델 사용
      schema: generatePromptResponseSchema,
      system: systemPrompt,
      prompt: userPrompt,
      // maxTokens: 1000,
    });

    return object;
  } catch (error) {
    console.error('Error generating object with AI SDK:', error);
    throw new Error('AI 프롬프트 생성에 실패했습니다.');
  }
}
