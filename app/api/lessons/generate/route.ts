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

    const gen = await generateLesson({
      subject, topics, gradeBand, languageMode,
      learningStyle: learningStyle || null,
      studyGoal: studyGoal || null,
      referenceTexts: referenceTexts || [],
    });

    if (!gen.ok) {
      return NextResponse.json({ error: gen.error }, { status: 500 });
    }

    const content = gen.data;

    const supabase = await createClient();
    let lesson: any = null;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('learner_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data: ls, error } = await supabase
          .from('generated_lessons')
          .insert({
            learner_profile_id: profile.id,
            user_id: user.id,
            subject,
            topic: topics[0],
            grade_band: gradeBand,
            language_mode: languageMode,
            content_json: content,
          })
          .select()
          .single();

        if (error) {
          console.warn('Lesson DB insert failed, returning content anyway:', error.message);
        } else {
          lesson = ls;
        }
      } else {
        console.warn('No learner profile found, skipping lesson DB persistence');
      }
    }

    return NextResponse.json({ lesson: lesson || null, content });
  } catch (error) {
    console.error('Lesson generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate lesson' },
      { status: 500 }
    );
  }
}
