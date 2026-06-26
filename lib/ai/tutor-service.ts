import { createAzure } from '@ai-sdk/azure';
import { streamText, convertToModelMessages, createUIMessageStreamResponse, type UIMessage, type TextStreamPart, type UIMessageChunk } from 'ai';
import { createClient } from '@/lib/supabase/server';
import {
  validateTutorResponse,
  extractTextFromUIMessage,
  FALLBACK_MESSAGES,
  type ValidationReason,
} from './validate';

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
    ? 'You are the AralGo AI Study Companion in chat mode.\nAnswer the student\'s questions directly in a normal, friendly Q&A style.\nKeep responses clear, concise, and helpful.\nExplain steps when they are useful, but do not force a Socratic question-first approach.\nUse emojis sparingly.\nDo not complete dishonest work for the student; help them understand instead.'
    : 'You are the AralGo AI Study Companion, a Socratic tutor.\n\nCore principles:\n- Guide the student to the answer by asking questions, not giving it directly.\n- Keep responses brief, friendly, and encouraging.\n- Use emojis very sparingly.\n- If the student is struggling, provide a small hint.\n- Never do their homework for them.';

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
    `Math formatting — CRITICAL:`,
    `- Wrap math expressions in \(...\) for inline or \[...\] for display math.`,
    `- CRITICAL: Each \(...\) or \[...\] block MUST be on a SINGLE line. NEVER put line breaks inside delimiters.`,
    `- Use \frac{a}{b} for fractions, x^2 for exponents, \sqrt{x} for square roots.`,
    `- GOOD: "Simplify: \(3x + 5 - 2x = 10\)" then "\[x + 5 = 10\]" then "\(x = 5\)"`,
    `- BAD (NEVER do this):`,
    `  \[ 3x + 5`,
    `  - 2x = 10 \]`,
    `- Each step gets its own math block. Do NOT put multiple lines inside one block.`,
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

  // Persist the latest user message and update session status
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  if (lastUserMsg) {
    const { error: msgErr } = await supabase
      .from('tutor_messages')
      .insert({
        study_session_id: resolvedSessionId,
        user_id: user.id,
        role: 'learner',
        language_mode: session.language_mode,
        content: extractTextFromUIMessage(lastUserMsg),
      });

    if (msgErr) {
      throw new TutorError('Failed to save message', 500);
    }

    const { error: sessErr } = await supabase
      .from('study_sessions')
      .update({ status: 'active', last_active_at: new Date().toISOString() })
      .eq('id', resolvedSessionId);

    if (sessErr) {
      console.error('Failed to update session status:', sessErr);
    }
  }

  // Generate AI response, buffer full stream, validate, then emit
  const result = streamText({
    model: tutorModel,
    system: buildSystemPrompt(context),
    messages: await convertToModelMessages(messages),
  });

  const chunks: TextStreamPart<any>[] = [];
  let aiText = '';

  try {
    for await (const chunk of result.fullStream) {
      chunks.push(chunk);
      if (chunk.type === 'text-delta') {
        aiText += chunk.text;
      }
    }
  } catch (streamErr) {
    console.error('AI streaming failed:', streamErr);
    aiText = '';
  }

  // Validate the complete response
  const validation = validateTutorResponse(aiText, session.language_mode, session.subject, session.topic);
  const responseText = validation.valid ? aiText : FALLBACK_MESSAGES[validation.reason || 'empty'];

  // Persist AI message (non-fatal if save fails — client already has the response)
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

  // Build UIMessageChunk stream from the validated (or fallback) text
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
