import { NextRequest, NextResponse } from 'next/server';
import { generateTextWithFallback } from '@/lib/ai/ai-client';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { prompt, userAnswer, correctAnswer, acceptableAnswers } = await req.json();

    if (!prompt || userAnswer === undefined || !correctAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, userAnswer, correctAnswer' },
        { status: 400 },
      );
    }

    const acceptableList = acceptableAnswers?.length
      ? `Acceptable alternative answers: ${acceptableAnswers.join(', ')}`
      : '';

    const { text } = await generateTextWithFallback({
      prompt: `You are a strict but fair grader. Grade the following student answer.

Question: ${prompt}
Correct answer: ${correctAnswer}
${acceptableList}
Student's answer: ${userAnswer}

Respond with a single JSON object. Do not include any other text.
{ "isCorrect": boolean, "feedback": "Brief explanation of why the answer is correct or incorrect (1-2 sentences)" }`,
    });

    const result = JSON.parse(text);

    return NextResponse.json({
      isCorrect: Boolean(result.isCorrect),
      feedback: result.feedback || '',
    });
  } catch (error) {
    console.error('Grading failed:', error);
    return NextResponse.json(
      { isCorrect: false, feedback: 'Grading failed. Please try again.' },
      { status: 200 },
    );
  }
}
