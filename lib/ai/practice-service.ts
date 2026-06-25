import { generateObject } from 'ai';
import { aiModel } from './ai-client';
import { buildPracticePrompt } from './prompts';
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

export async function generatePractice(input: PracticeInput): Promise<PracticeResult> {
  const prompt = buildPracticePrompt(input);

  const result = await generateObject({
    model: aiModel,
    prompt,
    schema: {
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
                },
              },
              correctAnswer: { type: 'string' },
              acceptableAnswers: { type: ['array', 'null'], items: { type: 'string' } },
              explanation: { type: 'string' },
              commonMistake: { type: ['string', 'null'] },
            },
            required: ['type', 'prompt', 'correctAnswer', 'explanation'],
          },
        },
      },
      required: ['questions'],
    },
  });

  return result.object;
}
