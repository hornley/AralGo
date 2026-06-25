import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import LessonStudioWizard from '@/components/lesson-studio/LessonStudioWizard';
import type { StudySubject } from '@/lib/types/supabase';
import styles from './lesson-studio.module.css';

export const metadata = {
  title: 'Lesson Studio - AralGo',
  description: 'Create AI-generated lessons and practice quizzes',
};

export default async function LessonStudioPage(props: { searchParams: Promise<{ subject?: string }> }) {
  const { subject } = await props.searchParams;
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

  const validSubjects = ['mathematics', 'science', 'english', 'filipino'] as const;
  const initialSubject = subject && validSubjects.includes(subject as any)
    ? (subject as StudySubject)
    : undefined;

  return (
    <div className={styles.pageContainer}>
      <nav className={styles.topBar}>
        <Link href="/home" className={styles.backLink} aria-label="Back to dashboard">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <span className={styles.topBarTitle}>Lesson Studio</span>
      </nav>
      <div className={styles.wizardCard}>
        <div className={styles.notebookLine} />
        <LessonStudioWizard
          subjects={subjects || []}
          initialSubject={initialSubject}
          gradeBand={profile?.grade_band || 'junior_high'}
          languageMode={profile?.preferred_language_mode || 'mixed'}
        />
      </div>
    </div>
  );
}
