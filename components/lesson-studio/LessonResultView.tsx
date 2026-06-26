'use client';

import { AppIcon } from '@/components/AppIcon';
import MathRenderer from '@/components/MathRenderer';
import { LessonContent } from '@/lib/types/supabase';
import styles from '../../app/(dashboard)/lesson-studio/lesson-studio.module.css';

export default function LessonResultView({ content }: { content: LessonContent }) {
  return (
    <div className={styles.lessonResult}>
      <section className={styles.lessonSection}>
        <h3><AppIcon name="summarize" size={20} /> Overview</h3>
        <p><MathRenderer text={content.overview} /></p>
      </section>
      {content.keyTerms.length > 0 && (
        <section className={styles.lessonSection}>
          <h3><AppIcon name="menu_book" size={20} /> Key Terms</h3>
          <dl>
            {content.keyTerms.map((kt, i) => (
              <div key={i} className={styles.termDef}>
                <dt><MathRenderer text={kt.term} /></dt>
                <dd><MathRenderer text={kt.definition} /></dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {content.workedExamples.length > 0 && (
        <section className={styles.lessonSection}>
          <h3><AppIcon name="exercise" size={20} /> Worked Examples</h3>
          {content.workedExamples.map((ex, i) => (
            <div key={i} className={styles.exampleBlock}>
              <strong><MathRenderer text={ex.title} /></strong>
              <p style={{ margin: '6px 0 0' }}><MathRenderer text={ex.content} /></p>
            </div>
          ))}
        </section>
      )}
      {content.commonMistakes.length > 0 && (
        <section className={styles.lessonSection}>
          <h3><AppIcon name="warning" size={20} /> Common Mistakes</h3>
          {content.commonMistakes.map((cm, i) => (
            <div key={i} className={styles.mistakeBlock}>
              <p style={{ margin: 0, fontWeight: 600, color: '#d32f2f' }}>&times; <MathRenderer text={cm.mistake} /></p>
              <p style={{ margin: '6px 0 0', color: '#2e7d32' }}>&#10003; <MathRenderer text={cm.correction} /></p>
            </div>
          ))}
        </section>
      )}
      <section className={styles.lessonSection}>
        <h3><AppIcon name="checklist" size={20} /> Quick Recap</h3>
        <p><MathRenderer text={content.recap} /></p>
      </section>
    </div>
  );
}
