import { createAzure } from '@ai-sdk/azure';
import { streamText, convertToModelMessages, createUIMessageStreamResponse, type UIMessage, type UIMessageChunk } from 'ai';
import { createClient } from '@/lib/supabase/server';
import {
  validateTutorResponse,
  extractTextFromUIMessage,
} from './validate';
import { getFallbackModel } from './ai-client';

// --- Types ---

export type TutorMode = 'socratic' | 'chat';
type GradeBand = 'elementary' | 'junior_high' | 'senior_high' | 'college_general';
type StudySubject = 'mathematics' | 'science' | 'english' | 'filipino';
type LanguageMode = 'english' | 'filipino' | 'mixed';

export interface TutorContext {
  displayName: string;
  gradeBand: GradeBand;
  subject: StudySubject;
  languageMode: LanguageMode;
  topic?: string | null;
  mode?: TutorMode;
}

// --- Grade band adaptation ---

const GRADE_BAND_INSTRUCTIONS: Record<GradeBand, string> = {
  elementary: 'Use very simple words and short sentences. Give concrete examples from daily life.',
  junior_high: 'Use clear explanations appropriate for a high school freshman level.',
  senior_high: 'You may introduce more abstract conceqpts appropriate for college-preparatory level.',
  college_general: 'Assume foundational knowledge. Focus on deeper understanding and critical thinking.',
};

// --- Subject adaptation ---

const SUBJECT_INSTRUCTIONS: Record<StudySubject, string> = {
  mathematics: 'Guide through step-by-step reasoning. Use Socratic questioning for problem-solving.',
  science: 'Encourage scientific thinking: hypothesis, observation, and conclusion.',
  english: 'Focus on reading comprehension, writing skills, and language analysis.',
  filipino: 'Focus on pagbasa, pagsulat, at pag-unawa sa Filipino.',
};

// --- Language mode adaptation ---

const LANGUAGE_INSTRUCTIONS: Record<LanguageMode, string> = {
  english: 'Respond in English only.',
  filipino: 'Respond in Filipino (Tagalog) only. Use conversational, everyday Filipino.',
  mixed: 'You may switch between Filipino and English naturally, as people do in everyday conversation.',
};

// --- Prompt builder ---

export function buildSystemPrompt(ctx: TutorContext): string {
  const mode = ctx.mode || 'socratic';

  const roleDesc = mode === 'chat'
    ? 'You are Aki, AralGo\'s friendly study buddy, in chat mode.\nAnswer the student\'s questions directly in a normal, friendly Q&A style.\nKeep responses clear, concise, and helpful.\nExplain steps when they are useful, but do not force a Socratic question-first approach.\nUse emojis sparingly.\nDo not complete dishonest work for the student; help them understand instead.'
    : 'You are Aki, AralGo\'s friendly study buddy and Socratic tutor.\n\nCore principles:\n- Guide the student to the answer by asking questions, not giving it directly.\n- Keep responses brief, friendly, and encouraging.\n- Use emojis very sparingly.\n- If the student is struggling, provide a small hint.\n- Never do their homework for them.';

  return [
    roleDesc,
    ``,
    `Student: ${ctx.displayName || 'a learner'}`,
    `Grade level: ${ctx.gradeBand.replace(/_/g, ' ')}`,
    `Subject: ${ctx.subject}${ctx.topic ? ` — Topic: ${ctx.topic}` : ''}`,
    ``,
    `Adaptation:`,
    `- ${GRADE_BAND_INSTRUCTIONS[ctx.gradeBand]}`,
    `- ${SUBJECT_INSTRUCTIONS[ctx.subject]}`,
    `- ${LANGUAGE_INSTRUCTIONS[ctx.languageMode]}`,
    ``,
    `Math formatting:`,
    `- You MUST wrap ALL math in \(...\) delimiters. Plain parentheses are not math.`,
    `- Each \(...\) block must be on a SINGLE line — no line breaks inside.`,
    `- Correct: "Simplify \(x + 5 = 10\) to get \(x = 5\)."`,
    `- Correct: "\(3x = 15\) then divide: \(x = 5\)."`,
    `- Use \frac{a}{b} for fractions, ^ for exponents, \sqrt{x} for roots.`,
  ].join('\n');
}

// --- Model setup ---

const requiredEnv = (...names: string[]) => {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }

  throw new Error(`Missing required environment variable. Expected one of: ${names.join(', ')}`);
};

const getAzureResourceName = () => {
  const endpoint = requiredEnv('AZURE_OPENAI_ENDPOINT', 'ENDPOINT');
  try {
    return new URL(endpoint).hostname.split('.')[0];
  } catch {
    return endpoint.replace('https://', '').split('.')[0];
  }
};

const azure = createAzure({
  resourceName: getAzureResourceName(),
  apiKey: requiredEnv('AZURE_OPENAI_API_KEY', 'API_KEY'),
});

const tutorModel = azure(requiredEnv('AZURE_OPENAI_DEPLOYMENT', 'DEPLOYMENT'));

// --- Streaming service ---

class TutorError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function streamTutorResponse(messages: UIMessage[], sessionId?: string, mode?: TutorMode) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new TutorError('Unauthorized', 401);
  }

  let resolvedSessionId = sessionId;

  if (!resolvedSessionId) {
    const { data: latestSession } = await supabase
      .from('study_sessions')
      .select('id')
      .eq('user_id', user.id)
      .order('last_active_at', { ascending: false })
      .limit(1)
      .single();

    if (latestSession) {
      resolvedSessionId = latestSession.id;
    }
  }

  if (!resolvedSessionId) {
    throw new TutorError('No active study session. Start a session from Home first.', 404);
  }

  const { data: session, error: sessionError } = await supabase
    .from('study_sessions')
    .select('subject, language_mode, topic, learner_profile_id')
    .eq('id', resolvedSessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    throw new TutorError('Study session not found.', 404);
  }

  const { data: profile, error: profileError } = await supabase
    .from('learner_profiles')
    .select('display_name, grade_band')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    throw new TutorError('Learner profile not found.', 404);
  }

  const context: TutorContext = {
    displayName: profile.display_name || '',
    gradeBand: profile.grade_band as GradeBand,
    subject: session.subject as StudySubject,
    languageMode: session.language_mode as LanguageMode,
    topic: session.topic,
    mode: mode,
  };

  // Mark session as active before AI call
  const { error: sessErr } = await supabase
    .from('study_sessions')
    .update({ status: 'active', last_active_at: new Date().toISOString() })
    .eq('id', resolvedSessionId);

  if (sessErr) {
    console.error('Failed to update session status:', sessErr);
  }

  // Extract last user message text for validation context
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  const userText = lastUserMsg ? extractTextFromUIMessage(lastUserMsg) : '';

  // Generate AI response with retry (try primary model, then fallback)
  const responseText = await generateTutorResponse(
    messages,
    context,
    userText,
  );

  if (!responseText) {
    throw new TutorError('Failed to generate a valid response. Please try again.', 500);
  }

  // Persist user message only after successful AI response
  if (lastUserMsg && userText) {
    const { error: msgErr } = await supabase
      .from('tutor_messages')
      .insert({
        study_session_id: resolvedSessionId,
        user_id: user.id,
        role: 'learner',
        language_mode: session.language_mode,
        content: userText,
      });

    if (msgErr) {
      console.error('Failed to save user message:', msgErr);
    }
  }

  // Persist AI response
  const { error: saveErr } = await supabase
    .from('tutor_messages')
    .insert({
      study_session_id: resolvedSessionId,
      user_id: user.id,
      role: 'assistant',
      language_mode: session.language_mode,
      content: responseText,
    });

  if (saveErr) {
    console.error('Failed to save AI message:', saveErr);
  }

  // Build UIMessageChunk stream from the validated text
  const chunkStream = new ReadableStream<UIMessageChunk>({
    start(controller) {
      controller.enqueue({ type: 'start' });
      controller.enqueue({ type: 'start-step' });
      controller.enqueue({ type: 'text-start', id: 't0' });
      controller.enqueue({ type: 'text-delta', id: 't0', delta: responseText });
      controller.enqueue({ type: 'text-end', id: 't0' });
      controller.enqueue({ type: 'finish-step' });
      controller.enqueue({ type: 'finish', finishReason: 'stop' });
      controller.close();
    },
  });

  return createUIMessageStreamResponse({ stream: chunkStream });
}

async function generateTutorResponse(
  messages: UIMessage[],
  context: TutorContext,
  userText: string,
): Promise<string | null> {
  const models = [tutorModel];
  const fallbackModel = getFallbackModel();
  if (fallbackModel) models.push(fallbackModel);

  const convertedMessages = await convertToModelMessages(messages);
  const system = buildSystemPrompt(context);

  for (const model of models) {
    try {
      const result = streamText({
        model,
        system,
        messages: convertedMessages,
      });

      let aiText = '';
      for await (const chunk of result.fullStream) {
        if (chunk.type === 'text-delta') {
          aiText += chunk.text;
        }
      }

      const validation = validateTutorResponse(
        aiText,
        context.languageMode,
        context.subject,
        context.topic,
        userText,
      );

      if (validation.valid) return aiText;

      console.warn(
        `Tutor response invalid (${validation.reason}), retrying with fallback model...`,
      );
    } catch (err) {
      console.error('AI call failed:', err);
    }
  }

  return null;
}
