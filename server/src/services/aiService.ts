import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { GeneratePromptRequestType, generatePromptResponseSchema } from '../schemas/promptSchema';
import { randomUUID } from 'crypto';

/**
 * 프롬프트 엔지니어링 메타 프롬프트 초안
 * 이 시스템 프롬프트는 Claude가 사용자의 초안을 바탕으로 2가지-3가지 버전의 고도화된 프롬프트를 생성하게 합니다.
 */
const getSystemPrompt = (domain?: string) => `
당신은 'Prompt-U' 플랫폼의 전문 프롬프트 엔지니어입니다.
사용자가 입력한 초안(originalInput)을 분석하고, AI 모델(예: ChatGPT, Claude 등)이 최상의 결과물을 낼 수 있도록 다듬어진 프롬프트 후보군을 생성해 주십시오.

요구사항:
1. 사용자의 의도와 ${domain ? `[${domain}] 목적에` : '목적에'} 부합하는 프롬프트를 작성하세요.
2. 각 후보 프롬프트는 서로 다른 톤, 포맷, 길이를 가지게끔 구성하세요. 
   예를 들어, 하나는 '명확하고 개조식'이면, 다른 하나는 '친근하고 서술형'으로 만들어 사용자에게 선택지를 제공하세요.
3. 변수나 사용자가 채워야 할 항목은 대괄호 [] 로 표시하세요.
4. 반드시 지정된 JSON 규격 구조(requestId, candidates)에 맞춰 응답하세요.
`;

export const generatePromptCandidates = async (
  requestData: GeneratePromptRequestType
) => {
  try {
    const { originalInput, context } = requestData;

    // Vercel AI SDK를 활용하여 Anthropic Claude Haiku 연동
    const result = await generateObject({
      model: anthropic('claude-haiku-4-5-20251001'),
      schema: generatePromptResponseSchema,
      system: getSystemPrompt(context?.domain),
      prompt: `사용자 초안: ${originalInput}`,
    });

    // 반환 시 요청했던 requestId를 새로 덮어쓰거나, AI 응답의 것을 쓴다면 유지
    // 보통은 백엔드에서 ID를 발급합니다.
    const finalResponse = {
      ...result.object,
      requestId: randomUUID(), // 항상 고유한 requestId를 생성하여 할당
    };

    return finalResponse;
  } catch (error) {
    console.error('Error generating prompts via AI SDK:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('프롬프트 생성 중 오류가 발생했습니다.');
  }
};
