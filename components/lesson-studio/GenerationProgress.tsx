'use client';

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
    <div className="generation-progress">
      <div className="progress-spinner" />
      <p className="progress-message">{STAGE_MESSAGES[stage] || 'Working on your lesson...'}</p>
    </div>
  );
}
