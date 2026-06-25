import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { TUTOR_SYSTEM_PROMPT, tutorModel } from '@/lib/ai/tutor-service';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = await streamText({
      model: tutorModel,
      system: TUTOR_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message || error.toString() }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
