import { jsonSchema, NoObjectGeneratedError, type RepairTextFunction } from 'ai';
import { generateObjectWithFallback } from './ai-client';
import { buildVerificationPrompt } from './prompts';

interface QuestionToVerify {
  index: number;
  type: string;
  prompt: string;
  options: { label: string; text: string }[] | null;
  correctAnswer: string;
  acceptableAnswers: string[] | null;
}

interface VerifiedAnswer {
  index: number;
  correctAnswer: string;
  acceptableAnswers: string[] | null;
  explanation: string;
}

interface VerificationResult {
  verified: VerifiedAnswer[];
}

const schema = jsonSchema<VerificationResult>({
  type: 'object',
  properties: {
    verified: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          index: { type: 'number' },
          correctAnswer: { type: 'string' },
          acceptableAnswers: { type: ['array', 'null'], items: { type: 'string' } },
          explanation: { type: 'string' },
        },
        required: ['index', 'correctAnswer', 'acceptableAnswers', 'explanation'],
        additionalProperties: false,
      },
    },
  },
  required: ['verified'],
  additionalProperties: false,
});

export async function verifyQuestions(
  questions: QuestionToVerify[],
  subject: string,
  gradeBand: string,
): Promise<{ questions: QuestionToVerify[]; corrections: string[] }> {
  try {
    const prompt = buildVerificationPrompt(questions, { subject, gradeBand });

    const repairText: RepairTextFunction = async ({ text, error }) => {
      console.error('Verification repair attempt:', error.message);
      return null;
    };

    const result = await generateObjectWithFallback<VerificationResult>({
      schema,
      prompt,
      experimental_repairText: repairText,
    });

    const corrections: string[] = [];
    const verified = result.object.verified;

    const fixed = questions.map((q) => {
      const v = verified.find((v) => v.index === q.index);
      if (!v) return q;

      const caChanged = v.correctAnswer !== q.correctAnswer;
      const aaChanged = JSON.stringify(v.acceptableAnswers) !== JSON.stringify(q.acceptableAnswers);

      if (caChanged || aaChanged) {
        corrections.push(`Q${q.index + 1}: ${v.explanation}`);
      }

      return {
        ...q,
        correctAnswer: v.correctAnswer,
        acceptableAnswers: v.acceptableAnswers,
      };
    });

    return { questions: fixed, corrections };
  } catch (err) {
    const message = err instanceof NoObjectGeneratedError
      ? 'Verification AI could not generate valid output'
      : (err as Error).message;
    console.error('Question verification error:', message);
    return { questions, corrections: [] };
  }
}
