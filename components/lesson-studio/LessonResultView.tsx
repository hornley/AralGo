'use client';

import { LessonContent } from '@/lib/types/supabase';

interface LessonResultViewProps {
  content: LessonContent;
}

export default function LessonResultView({ content }: LessonResultViewProps) {
  return (
    <div className="lesson-result">
      <section className="lesson-section overview">
        <h3>Overview</h3>
        <p>{content.overview}</p>
      </section>
      {content.keyTerms.length > 0 && (
        <section className="lesson-section key-terms">
          <h3>Key Terms</h3>
          <dl>
            {content.keyTerms.map((kt, i) => (
              <div key={i} className="term-def">
                <dt>{kt.term}</dt>
                <dd>{kt.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {content.workedExamples.length > 0 && (
        <section className="lesson-section examples">
          <h3>Worked Examples</h3>
          {content.workedExamples.map((ex, i) => (
            <div key={i} className="example-block">
              <h4>{ex.title}</h4>
              <p>{ex.content}</p>
            </div>
          ))}
        </section>
      )}
      {content.commonMistakes.length > 0 && (
        <section className="lesson-section mistakes">
          <h3>Common Mistakes</h3>
          {content.commonMistakes.map((cm, i) => (
            <div key={i} className="mistake-block">
              <p className="mistake">&times; {cm.mistake}</p>
              <p className="correction">&#10003; {cm.correction}</p>
            </div>
          ))}
        </section>
      )}
      <section className="lesson-section recap">
        <h3>Quick Recap</h3>
        <p>{content.recap}</p>
      </section>
    </div>
  );
}
