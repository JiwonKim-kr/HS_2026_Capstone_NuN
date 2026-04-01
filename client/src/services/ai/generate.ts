import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { generatePromptResponseSchema, GeneratePromptRequestType } from '@/schemas/promptSchema';

/**
 * Zod 스키마에 맞춰 최적화된 프롬프트를 생성하는 AI 서비스 함수
 * @param requestData 프롬프트 생성 요청 데이터
 */
export async function generateOptimizedPrompt(requestData: GeneratePromptRequestType) {
  const { topic, tone, targetAudience, additionalInstructions } = requestData;

  // 시스템과 사용자 프롬프트 구성
  const systemPrompt = `당신은 세계 최고 수준의 프롬프트 엔지니어입니다.
사용자가 제안한 주제를 바탕으로 완벽하게 동작하고 상세한 프롬프트를 설계해 주는 것이 목표입니다.
반드시 제공된 JSON 스키마 형식에 맞게 응답해야 합니다.`;

  const userPrompt = `
다음 정보를 바탕으로 최적화된 프롬프트를 생성해 주세요:
- 주제: ${topic}
- 어조 및 톤: ${tone || '일반적인'}
- 대상 독자/사용자: ${targetAudience || '제한 없음'}
- 추가 요구사항: ${additionalInstructions || '없음'}

가능한 구체적이고 바로 복사해서 사용할 수 있는 프롬프트를 작성하고, 그 이유와 변수 목록도 제공해 주세요.
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
