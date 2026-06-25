import { generateObject, jsonSchema } from 'ai';
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

export async function suggestTopics(input: TopicSuggestionInput): Promise<TopicSuggestionResult> {
  const prompt = buildTopicSuggestionPrompt({
    subject: input.subject,
    gradeBand: input.gradeBand,
    languageMode: input.languageMode,
  });

  const result = await generateObject({
    model: aiModel,
    prompt,
    schema: jsonSchema<TopicSuggestionResult>({
      type: 'object',
      properties: {
        topics: { type: 'array', items: { type: 'string' } },
      },
      required: ['topics'],
    }),
  });

  return result.object;
}
