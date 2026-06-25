import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import styles from '../lessons.module.css';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lesson, error } = await supabase
    .from("generated_lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !lesson) {
    return (
      <div className={styles.container}>
        <Link href="/lessons" className={styles.topicChip} style={{ display: 'inline-flex', marginBottom: 24 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Back to Lessons
        </Link>
        <h1>Lesson not found</h1>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link
        href="/lessons"
        className={styles.topicChip}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24, textDecoration: 'none' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
        Back to Lessons
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>{lesson.topic}</h1>
        <p className={styles.subtitle}>
          {lesson.subject} &middot; {lesson.grade_band}
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E0D8CC' }}>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, lineHeight: 1.6 }}>
          {JSON.stringify(lesson.content_json, null, 2)}
        </pre>
      </div>
    </div>
  );
}
