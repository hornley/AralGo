'use client';

import styles from '../../app/lesson-studio/lesson-studio.module.css';

interface PracticeQuestionView {
  type: string;
  prompt: string;
  options: { label: string; text: string }[] | null;
  correctAnswer: string;
  acceptableAnswers: string[] | null;
  explanation: string;
  commonMistake: string | null;
}

interface PracticeResultViewProps {
  questions: PracticeQuestionView[];
  onStartPractice: () => void;
}

export default function PracticeResultView({ questions, onStartPractice }: PracticeResultViewProps) {
  return (
    <div className={styles.practiceResult}>
      <h3><span className="material-symbols-outlined" style={{ fontSize: 20 }}>quiz</span> Practice Quiz</h3>
      <div className={styles.questionPreviewList}>
        {questions.map((q, i) => (
          <div key={i} className={styles.questionPreview}>
            <span className={styles.qNumber}>{i + 1}.</span>
            <span className={styles.qType}>{q.type.replace(/_/g, ' ')}</span>
            <p className={styles.qPrompt}>{q.prompt}</p>
          </div>
        ))}
      </div>
      <div className={styles.actionButtons}>
        <button className={styles.startPracticeBtn} onClick={onStartPractice}>
          <span className="material-symbols-outlined">play_arrow</span>
          Start Practice
        </button>
      </div>
    </div>
  );
}
