import { jsonSchema, NoObjectGeneratedError, type RepairTextFunction } from 'ai';
import { generateObjectWithFallback } from './ai-client';
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

export type GenerateLessonResult =
  | { ok: true; data: LessonContent }
  | { ok: false; error: string };

const schema = jsonSchema<LessonContent>({
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
        additionalProperties: false,
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
        additionalProperties: false,
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
        additionalProperties: false,
      },
    },
    recap: { type: 'string' },
  },
  required: ['overview', 'keyTerms', 'workedExamples', 'commonMistakes', 'recap'],
  additionalProperties: false,
});

const repairText: RepairTextFunction = async ({ text, error }) => {
  console.error('Lesson generation repair attempt:', error.message);
  return null;
};

export async function generateLesson(input: LessonInput): Promise<GenerateLessonResult> {
  try {
    const prompt = buildLessonPrompt(input);

    const result = await generateObjectWithFallback<{ overview: string; keyTerms: { term: string; definition: string }[]; workedExamples: { title: string; content: string }[]; commonMistakes: { mistake: string; correction: string }[]; recap: string }>({
      schema,
      prompt,
      experimental_repairText: repairText,
    });

    return { ok: true, data: result.object };
  } catch (err) {
    const message =
      err instanceof NoObjectGeneratedError
        ? 'The AI could not generate a valid lesson. Please try again.'
        : `Lesson generation failed: ${(err as Error).message}`;
    console.error('Lesson generation error:', err);
    return { ok: false, error: message };
  }
}
