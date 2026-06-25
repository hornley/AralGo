import { type UIMessage } from 'ai';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'sessionId query parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const { data: rows, error } = await supabase
      .from('tutor_messages')
      .select('id, role, content, created_at')
      .eq('study_session_id', sessionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch messages:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch messages' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const messages: UIMessage[] = (rows ?? []).map(row => ({
      id: row.id,
      role: row.role === 'learner' ? 'user' : row.role as 'user' | 'assistant' | 'system',
      parts: [{ type: 'text' as const, text: row.content }],
    }));

    return new Response(
      JSON.stringify({ messages }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Chat history API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
