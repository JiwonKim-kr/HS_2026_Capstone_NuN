import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

// 표시 전용 번역. 생성 프롬프트의 '원문'은 그대로 두고, UI에 보여줄 번역본만 만든다.
// (예: 미디어 모달리티 content는 항상 영어로 생성되므로, 한국어 사용자에게 보여줄 때만 번역)
const TARGET_LANGUAGE_LABEL: Record<'ko' | 'en', string> = {
  ko: 'Korean',
  en: 'English',
};

export async function translatePromptText(
  text: string,
  targetLanguage: 'ko' | 'en'
): Promise<string> {
  const label = TARGET_LANGUAGE_LABEL[targetLanguage];
  const result = await generateText({
    model: anthropic('claude-haiku-4-5'),
    temperature: 0,
    maxOutputTokens: 2048,
    system: `You are a professional translator. Translate the user's text into ${label}.
The text is an AI image/video/music generation prompt, shown to a human only so they can understand its meaning.
Translate naturally and faithfully; keep widely-recognized technical/art terms intelligible.
Output ONLY the translation — no preamble, no quotes, no notes.`,
    prompt: text,
  });
  return result.text.trim();
}
