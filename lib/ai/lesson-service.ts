import { generateObject } from 'ai';
import { aiModel } from './ai-client';
import { buildLessonPrompt } from './prompts';
import { GradeBand, StudySubject, LanguageMode, LearningStyle, LessonContent } from '@/lib/types/supabase';

interface LessonInput {
  subject: StudySubject;
  topics: string[];
  gradeBand: GradeBand;
  languageMode: LanguageMode;
  learningStyle: LearningStyle | null;
  studyGoal: string | null;
  referenceTexts: string[];
}

export async function generateLesson(input: LessonInput): Promise<LessonContent> {
  const prompt = buildLessonPrompt(input);

  const result = await generateObject({
    model: aiModel,
    prompt,
    schema: {
      type: 'object',
      properties: {
        overview: { type: 'string' },
        keyTerms: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              term: { type: 'string' },
              definition: { type: 'string' },
            },
            required: ['term', 'definition'],
          },
        },
        workedExamples: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
            },
            required: ['title', 'content'],
          },
        },
        commonMistakes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              mistake: { type: 'string' },
              correction: { type: 'string' },
            },
            required: ['mistake', 'correction'],
          },
        },
        recap: { type: 'string' },
      },
      required: ['overview', 'keyTerms', 'workedExamples', 'commonMistakes', 'recap'],
    },
  });

  return result.object;
}
