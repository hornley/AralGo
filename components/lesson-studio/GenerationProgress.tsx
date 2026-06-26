'use client';

import styles from '../../app/(dashboard)/lesson-studio/lesson-studio.module.css';

interface GenerationProgressProps {
  stage: 'topics' | 'lesson' | 'practice' | null;
}

const STAGE_MESSAGES: Record<string, string> = {
  topics: 'Choosing the right topics for you...',
  lesson: 'Creating your personalized lesson...',
  practice: 'Generating practice questions...',
};

export default function GenerationProgress({ stage }: GenerationProgressProps) {
  if (!stage) return null;
  return (
    <div className={styles.generationProgress}>
      <div className={styles.progressSpinner} />
      <p className={styles.progressMessage}>
        <span>{STAGE_MESSAGES[stage] || 'Working on your lesson...'}</span>
      </p>
    </div>
  );
}
