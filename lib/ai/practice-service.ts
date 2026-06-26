import { jsonSchema, NoObjectGeneratedError, type RepairTextFunction } from 'ai';
import { generateObjectWithFallback } from './ai-client';
import { buildPracticePrompt } from './prompts';
import { verifyQuestions } from './verify-service';
import { GradeBand, StudySubject, LanguageMode, LearningStyle } from '@/lib/types/supabase';

interface PracticeInput {
  subject: StudySubject;
  topics: string[];
  gradeBand: GradeBand;
  languageMode: LanguageMode;
  learningStyle: LearningStyle | null;
  studyGoal: string | null;
  practiceFormat: string | null;
  questionCount: number;
  referenceTexts: string[];
}

interface GeneratedQuestion {
  type: 'multiple_choice' | 'short_answer' | 'problem_solving';
  prompt: string;
  options: { label: string; text: string }[] | null;
  correctAnswer: string;
  acceptableAnswers: string[] | null;
  explanation: string;
  commonMistake: string | null;
}

export interface PracticeResult {
  questions: GeneratedQuestion[];
}

export type GeneratePracticeResult =
  | { ok: true; data: PracticeResult }
  | { ok: false; error: string };

const schema = jsonSchema<PracticeResult>({
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['multiple_choice', 'short_answer', 'problem_solving'] },
          prompt: { type: 'string' },
          options: {
            type: ['array', 'null'],
            items: {
              type: 'object',
              properties: { label: { type: 'string' }, text: { type: 'string' } },
              required: ['label', 'text'],
              additionalProperties: false,
            },
          },
          correctAnswer: { type: 'string' },
          acceptableAnswers: { type: ['array', 'null'], items: { type: 'string' } },
          explanation: { type: 'string' },
          commonMistake: { type: ['string', 'null'] },
        },
        required: ['type', 'prompt', 'options', 'correctAnswer', 'acceptableAnswers', 'explanation', 'commonMistake'],
        additionalProperties: false,
      },
    },
  },
  required: ['questions'],
  additionalProperties: false,
});

const repairText: RepairTextFunction = async ({ text, error }) => {
  console.error('Practice generation repair attempt:', error.message);
  return null;
};

export async function generatePractice(input: PracticeInput): Promise<GeneratePracticeResult> {
  try {
    const prompt = buildPracticePrompt(input);

    const result = await generateObjectWithFallback<{ questions: { type: string; prompt: string; options: { label: string; text: string }[] | null; correctAnswer: string; acceptableAnswers: string[] | null; explanation: string; commonMistake: string | null }[] }>({
      schema,
      prompt,
      experimental_repairText: repairText,
    });

    const rawQuestions = (result.object as PracticeResult).questions;
    const questionsWithIndex = rawQuestions.map((q, i) => ({
      index: i,
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: q.correctAnswer,
      acceptableAnswers: q.acceptableAnswers,
    }));

    const { questions: verifiedQuestions, corrections } = await verifyQuestions(
      questionsWithIndex,
      input.subject,
      input.gradeBand,
    );

    if (corrections.length > 0) {
      console.log('Practice answer verification corrections:', corrections);
    }

    const finalQuestions = rawQuestions.map((q, i) => ({
      ...q,
      correctAnswer: verifiedQuestions[i]?.correctAnswer ?? q.correctAnswer,
      acceptableAnswers: verifiedQuestions[i]?.acceptableAnswers ?? q.acceptableAnswers,
    }));

    return { ok: true, data: { questions: finalQuestions } };
  } catch (err) {
    const message =
      err instanceof NoObjectGeneratedError
        ? 'The AI could not generate valid practice questions. Please try again.'
        : `Practice generation failed: ${(err as Error).message}`;
    console.error('Practice generation error:', err);
    return { ok: false, error: message };
  }
}
