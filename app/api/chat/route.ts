import { type UIMessage } from 'ai';
import { streamTutorResponse } from '@/lib/ai/tutor-service';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, sessionId }: {
      messages: UIMessage[];
      sessionId?: string;
    } = await req.json();

    const result = await streamTutorResponse(messages, sessionId);
    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);

    const status =
      error.status === 401 ? 401
        : error.status === 404 ? 404
        : 500;

    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
    }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
