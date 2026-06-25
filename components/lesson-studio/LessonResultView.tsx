'use client';

import { LessonContent } from '@/lib/types/supabase';
import styles from '../../app/lesson-studio/lesson-studio.module.css';

export default function LessonResultView({ content }: { content: LessonContent }) {
  return (
    <div className={styles.lessonResult}>
      <section className={styles.lessonSection}>
        <h3><span className="material-symbols-outlined" style={{ fontSize: 20 }}>summarize</span> Overview</h3>
        <p>{content.overview}</p>
      </section>
      {content.keyTerms.length > 0 && (
        <section className={styles.lessonSection}>
          <h3><span className="material-symbols-outlined" style={{ fontSize: 20 }}>menu_book</span> Key Terms</h3>
          <dl>
            {content.keyTerms.map((kt, i) => (
              <div key={i} className={styles.termDef}>
                <dt>{kt.term}</dt>
                <dd>{kt.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {content.workedExamples.length > 0 && (
        <section className={styles.lessonSection}>
          <h3><span className="material-symbols-outlined" style={{ fontSize: 20 }}>exercise</span> Worked Examples</h3>
          {content.workedExamples.map((ex, i) => (
            <div key={i} className={styles.exampleBlock}>
              <strong>{ex.title}</strong>
              <p style={{ margin: '6px 0 0' }}>{ex.content}</p>
            </div>
          ))}
        </section>
      )}
      {content.commonMistakes.length > 0 && (
        <section className={styles.lessonSection}>
          <h3><span className="material-symbols-outlined" style={{ fontSize: 20 }}>warning</span> Common Mistakes</h3>
          {content.commonMistakes.map((cm, i) => (
            <div key={i} className={styles.mistakeBlock}>
              <p style={{ margin: 0, fontWeight: 600, color: '#d32f2f' }}>&times; {cm.mistake}</p>
              <p style={{ margin: '6px 0 0', color: '#2e7d32' }}>&#10003; {cm.correction}</p>
            </div>
          ))}
        </section>
      )}
      <section className={styles.lessonSection}>
        <h3><span className="material-symbols-outlined" style={{ fontSize: 20 }}>checklist</span> Quick Recap</h3>
        <p>{content.recap}</p>
      </section>
    </div>
  );
}
