import { NextRequest, NextResponse } from 'next/server';
import { generateLesson } from '@/lib/ai/lesson-service';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, topics, gradeBand, languageMode, learningStyle, studyGoal, referenceTexts } = body;

    if (!subject || !topics?.length || !gradeBand || !languageMode) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, topics, gradeBand, languageMode' },
        { status: 400 }
      );
    }

    const content = await generateLesson({
      subject, topics, gradeBand, languageMode,
      learningStyle: learningStyle || null,
      studyGoal: studyGoal || null,
      referenceTexts: referenceTexts || [],
    });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('learner_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: lesson, error } = await supabase
      .from('generated_lessons')
      .insert({
        learner_profile_id: profile.id,
        user_id: user.id,
        subject,
        topic: topics[0],
        topics,
        grade_band: gradeBand,
        language_mode: languageMode,
        learning_style: learningStyle,
        study_goal: studyGoal,
        content_json: content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lesson, content });
  } catch (error) {
    console.error('Lesson generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate lesson' },
      { status: 500 }
    );
  }
}
