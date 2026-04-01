import { z } from 'zod';

// 프론트엔드에서 API로 보내는 프롬프트 생성 요청 데이터 스키마
export const generatePromptRequestSchema = z.object({
  topic: z.string().min(1, '주제를 입력해주세요.'),
  tone: z.string().optional().describe('원하는 답변의 어조 (예: 전문적인, 친근한)'),
  targetAudience: z.string().optional().describe('대상 독자 (예: 초보자, 전문가)'),
  additionalInstructions: z.string().optional().describe('추가적인 요구사항이나 제약조건'),
});

export type GeneratePromptRequestType = z.infer<typeof generatePromptRequestSchema>;

// AI가 응답해야 하는 구조화된 프롬프트 결과 데이터 스키마
export const generatePromptResponseSchema = z.object({
  title: z.string().describe('생성된 프롬프트의 제목'),
  optimizedPrompt: z.string().describe('사용자가 복사해서 사용할 수 있는 최적화된 프롬프트 내용'),
  explanation: z.string().describe('이 프롬프트가 왜 효과적인지에 대한 간단한 설명'),
  suggestedVariables: z.array(z.string()).describe('사용자가 채워 넣어야 할 변수명 목록 (예: [회사명], [제품명])'),
});

export type GeneratePromptResponseType = z.infer<typeof generatePromptResponseSchema>;