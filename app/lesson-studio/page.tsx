import { createClient } from '@/lib/supabase/server';
import LessonStudioWizard from '@/components/lesson-studio/LessonStudioWizard';

export const metadata = {
  title: 'Lesson Studio - AralGo',
  description: 'Create AI-generated lessons and practice quizzes',
};

export default async function LessonStudioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <p>Please sign in to access the Lesson Studio.</p>;
  }
  const { data: profile } = await supabase
    .from('learner_profiles')
    .select('preferred_subjects, grade_band, preferred_language_mode')
    .eq('user_id', user.id)
    .single();
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('sort_order');
  return (
    <div className="lesson-studio-page">
      <LessonStudioWizard
        subjects={subjects || []}
        initialSubject={undefined}
        gradeBand={profile?.grade_band || 'junior_high'}
        languageMode={profile?.preferred_language_mode || 'mixed'}
      />
    </div>
  );
}
