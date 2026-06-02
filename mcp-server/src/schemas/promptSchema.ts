import { z } from 'zod';

// 프론트엔드에서 API로 보내는 프롬프트 생성 요청 데이터 스키마 (API 명세서 기준)
export const generatePromptRequestSchema = z.object({
  userId: z.string().uuid('유효한 사용자 ID가 필요합니다.').describe('사용자 고유 UUID'),
  originalInput: z.string().min(1, '초안 내용을 입력해주세요.').describe('사용자가 입력한 초안 내용'),
  language: z.enum(['ko', 'en']).optional().default('ko').describe('사용자 인터페이스 언어 (ko: 한국어, en: 영어)'),
  context: z.object({
    domain: z.string().optional().describe('업무, 창작 등 목적'),
  }).optional(),
});

export type GeneratePromptRequestType = z.infer<typeof generatePromptRequestSchema>;

// 타겟 AI 모달리티 (초안에서 자동 감지)
export const targetModalitySchema = z.enum(['text', 'image', 'video', 'music']);
export type TargetModality = z.infer<typeof targetModalitySchema>;

// AI가 응답에 담아 보낼 개별 프롬프트 후보군 스키마
export const promptCandidateSchema = z.object({
  candidateId: z.string().describe('후보 고유 ID'),
  logId: z.string().uuid().optional().describe('DB에 저장된 prompt_logs ID'),
  content: z.string().describe('최적화된 프롬프트 내용'),
  metadata: z.object({
    tone: z.string().optional(),
    format: z.string().optional(),
    length: z.string().optional(),
    targetModality: targetModalitySchema.optional().describe('감지된 타겟 AI 모달리티'),
    variant: z.enum(['exact', 'variant_a', 'variant_b']).optional(),
    tierDescription: z.string().optional(),
    appliedTiers: z.record(z.string(), z.number()).optional(),
  }),
});

export type PromptCandidateType = z.infer<typeof promptCandidateSchema>;

// 프론트엔드에서 받게 될 AI의 최종 응답 스키마 구조
export const generatePromptResponseSchema = z.object({
  requestId: z.string().uuid().describe('이번 생성 요청의 고유 ID'),
  candidates: z.array(promptCandidateSchema),
});

// LLM이 실제로 생성하는 부분만 담은 스키마.
// 주의: Anthropic 구조화 출력(output_config)은 'object' 타입의 propertyNames를 지원하지 않으므로
// z.record(개방형 맵)를 LLM 스키마에 넣으면 400 에러가 난다. appliedTiers 등 코드 주입 메타데이터는 제외.
export const promptGenerationSchema = z.object({
  candidates: z.array(z.object({
    candidateId: z.string().describe('후보 고유 ID'),
    content: z.string().describe('최적화된 프롬프트 내용'),
    metadata: z.object({
      tone: z.string().optional(),
      format: z.string().optional(),
      length: z.string().optional(),
    }),
  })),
});

export type GeneratePromptResponseType = z.infer<typeof generatePromptResponseSchema>;
