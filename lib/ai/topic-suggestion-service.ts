import { generateObject, jsonSchema, NoObjectGeneratedError, type RepairTextFunction } from 'ai';
import { aiModel } from './ai-client';
import { buildTopicSuggestionPrompt } from './prompts';
import { GradeBand, StudySubject, LanguageMode } from '@/lib/types/supabase';

interface TopicSuggestionInput {
  subject: StudySubject;
  gradeBand: GradeBand;
  languageMode: LanguageMode;
}

interface TopicSuggestionResult {
  topics: string[];
}

export type SuggestTopicsResult =
  | { ok: true; data: TopicSuggestionResult }
  | { ok: false; error: string };

const schema = jsonSchema<TopicSuggestionResult>({
  type: 'object',
  properties: {
    topics: { type: 'array', items: { type: 'string' } },
  },
  required: ['topics'],
  additionalProperties: false,
});

const repairText: RepairTextFunction = async ({ text, error }) => {
  console.error('Topic suggestion repair attempt:', error.message);
  return null;
};

export async function suggestTopics(input: TopicSuggestionInput): Promise<SuggestTopicsResult> {
  try {
    const prompt = buildTopicSuggestionPrompt({
      subject: input.subject,
      gradeBand: input.gradeBand,
      languageMode: input.languageMode,
    });

    const result = await generateObject({
      model: aiModel,
      prompt,
      schema,
      experimental_repairText: repairText,
    });

    return { ok: true, data: result.object };
  } catch (err) {
    const message =
      err instanceof NoObjectGeneratedError
        ? 'The AI could not generate topic suggestions. Please try again.'
        : `Topic suggestion failed: ${(err as Error).message}`;
    console.error('Topic suggestion error:', err);
    return { ok: false, error: message };
  }
}
