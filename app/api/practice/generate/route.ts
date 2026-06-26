import { NextRequest, NextResponse } from 'next/server';
import { generatePractice } from '@/lib/ai/practice-service';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, topics, gradeBand, languageMode, learningStyle, studyGoal, practiceFormat, questionCount, referenceTexts, generatedLessonId } = body;

    if (!subject || !topics?.length || !gradeBand || !languageMode) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, topics, gradeBand, languageMode' },
        { status: 400 }
      );
    }

    const gen = await generatePractice({
      subject, topics, gradeBand, languageMode,
      learningStyle: learningStyle || null,
      studyGoal: studyGoal || null,
      practiceFormat: practiceFormat || null,
      questionCount: questionCount || 5,
      referenceTexts: referenceTexts || [],
    });

    if (!gen.ok) {
      return NextResponse.json({ error: gen.error }, { status: 500 });
    }

    const practice = gen.data;

    const supabase = await createClient();
    let practiceSet: any = null;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('learner_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data: ps, error: setError } = await supabase
          .from('practice_sets')
          .insert({
            learner_profile_id: profile.id,
            user_id: user.id,
            subject,
            topic: topics[0],
            difficulty: 'medium',
            language_mode: languageMode,
          })
          .select()
          .single();

        if (!setError) {
          practiceSet = ps;
          const questions = practice.questions.map((q: any, i: number) => ({
            practice_set_id: practiceSet.id,
            question_type: q.type,
            prompt: q.prompt,
            options_json: q.options,
            answer_key_json: { correctAnswer: q.correctAnswer, acceptableAnswers: q.acceptableAnswers },
            explanation_json: { explanation: q.explanation, commonMistake: q.commonMistake },
            ordinal: i,
          }));

          const { error: qError } = await supabase
            .from('practice_questions')
            .insert(questions);

          if (qError) {
            console.warn('Practice questions DB insert failed:', qError.message);
          }
        } else {
          console.warn('Practice set DB insert failed, returning questions anyway:', setError.message);
        }
      } else {
        console.warn('No learner profile found, skipping practice DB persistence');
      }
    }

    return NextResponse.json({ practiceSet: practiceSet || null, questions: practice.questions });
  } catch (error) {
    console.error('Practice generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate practice questions' },
      { status: 500 }
    );
  }
}
