import { NextRequest, NextResponse } from 'next/server';
import { suggestTopics } from '@/lib/ai/topic-suggestion-service';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { subject, gradeBand, languageMode } = await req.json();

    if (!subject || !gradeBand || !languageMode) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, gradeBand, languageMode' },
        { status: 400 }
      );
    }

    const result = await suggestTopics({ subject, gradeBand, languageMode });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Topic suggestion failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate topic suggestions' },
      { status: 500 }
    );
  }
}
