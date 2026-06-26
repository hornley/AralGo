import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { subject, topic, gradeBand, languageMode, questions, score, total } = await req.json();

    if (!subject || !questions?.length || score === undefined || !total) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 200 });
    }

    const { data: profile } = await supabase
      .from('learner_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ ok: false, error: 'No learner profile' }, { status: 200 });
    }

    const { data: practiceSet, error: setError } = await supabase
      .from('practice_sets')
      .insert({
        learner_profile_id: profile.id,
        user_id: user.id,
        subject,
        topic: topic || questions[0]?.topic || subject,
        difficulty: 'medium',
        language_mode: languageMode || 'mixed',
      })
      .select()
      .single();

    if (setError) {
      console.warn('Could not create practice set:', setError.message);
      return NextResponse.json({ ok: false, error: setError.message }, { status: 200 });
    }

    const { data: attempt, error: attemptError } = await supabase
      .from('practice_attempts')
      .insert({
        learner_profile_id: profile.id,
        user_id: user.id,
        practice_set_id: practiceSet.id,
        score: Math.round((score / total) * 100),
      })
      .select()
      .single();

    if (attemptError) {
      console.warn('Could not create practice attempt:', attemptError.message);
      return NextResponse.json({ ok: false, error: attemptError.message }, { status: 200 });
    }

    const { data: dbQuestions } = await supabase
      .from('practice_questions')
      .select('id, ordinal')
      .eq('practice_set_id', practiceSet.id)
      .order('ordinal');

    const responses = questions.map((q: any, i: number) => {
      const dbQ = dbQuestions?.[i];
      return {
        practice_attempt_id: attempt.id,
        practice_question_id: dbQ?.id || null,
        user_id: user.id,
        learner_answer_json: { answer: q.userAnswer },
        is_correct: q.isCorrect,
        feedback_json: q.feedback ? { feedback: q.feedback } : null,
      };
    });

    const { error: respError } = await supabase
      .from('practice_responses')
      .insert(responses);

    if (respError) {
      console.warn('Could not save practice responses:', respError.message);
    }

    return NextResponse.json({ ok: true, attemptId: attempt.id });
  } catch (error) {
    console.error('Practice submit failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to save practice results' },
      { status: 200 },
    );
  }
}
