'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { AppIcon } from '@/components/AppIcon';
import styles from './results.module.css';

interface QuestionResult {
  prompt: string;
  type: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  feedback?: string;
  options?: { label: string; text: string }[] | null;
}

function resolveLabel(label: string, options?: { label: string; text: string }[] | null): string {
  if (options) {
    const opt = options.find((o) => o.label === label);
    if (opt) return `${opt.label}. ${opt.text}`;
  }
  return label;
}

function ResultsContent() {
  const params = useSearchParams();
  const [reviewing, setReviewing] = useState(false);
  const [questions, setQuestions] = useState<QuestionResult[]>([]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('practice.quizResults');
      if (stored) {
        setQuestions(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const rawScore = params.get('score');
  const total = Number(params.get('total')) || 1;
  const correct = Number(params.get('correct')) || 0;
  const time = Number(params.get('time')) || 0;
  const topic = params.get('topic') || 'your next topic';

  const score = rawScore !== null ? Number(rawScore) : Math.round((correct / total) * 100);

  const circumference = 251.2;
  const offset = circumference * (1 - score / 100);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formattedTime = `${minutes}m ${seconds}s`;

  const incorrectQuestions = questions.filter((q) => !q.isCorrect);

  if (reviewing) {
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Review Mistakes</h1>
          <p className={styles.subtitle}>
            {incorrectQuestions.length} of {questions.length} questions need review
          </p>
        </div>

        <div className={styles.reviewList}>
          {incorrectQuestions.map((q, i) => (
            <div key={i} className={styles.reviewCard}>
              <div className={styles.reviewQuestion}>{q.prompt}</div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Your answer:</span>
                <span className={styles.reviewWrong}>{resolveLabel(q.userAnswer, q.options) || '(no answer)'}</span>
              </div>
              <div className={styles.reviewRow}>
                <span className={styles.reviewLabel}>Correct answer:</span>
                <span className={styles.reviewCorrect}>{resolveLabel(q.correctAnswer, q.options)}</span>
              </div>
              {q.feedback && (
                <div className={styles.reviewFeedback}>{q.feedback}</div>
              )}
            </div>
          ))}
          {incorrectQuestions.length === 0 && (
            <div className={styles.reviewCard}>
              <p className={styles.reviewEmpty}>Perfect score! No mistakes to review.</p>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button onClick={() => setReviewing(false)} className={styles.btnPrimary}>
            <AppIcon name="arrow_back" />
            Back to results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Great work, Scholar! 🏆</h1>
        <p className={styles.subtitle}>You crushed that practice session.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.scoreRingWrapper}>
          <svg className={styles.scoreRing} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" className={styles.ringTrack} />
            <circle cx="50" cy="50" r="40" className={styles.ringProgress}
              strokeDasharray={circumference} strokeDashoffset={offset} />
          </svg>
          <div className={styles.scoreContent}>
            <span className={styles.scoreValue}>{score}%</span>
            <span className={styles.scoreLabel}>SCORE</span>
          </div>
        </div>

        <div className={styles.metricsRow}>
          <div className={styles.metricBox}>
            <AppIcon name="schedule" className={styles.metricIcon} />
            <div className={styles.metricLabel}>SPEED</div>
            <div className={styles.metricValue}>{formattedTime}</div>
          </div>
          <div className={styles.metricBox}>
            <AppIcon name="check_circle" className={styles.metricIcon} />
            <div className={styles.metricLabel}>ACCURACY</div>
            <div className={styles.metricValue}>{correct} / {total}</div>
          </div>
        </div>

        <div className={styles.streakBox}>
          <AppIcon name="local_fire_department" className={styles.streakIcon} />
          <div>
            <div className={styles.metricLabel}>STREAK</div>
            <div className={styles.metricValue}>Unbroken</div>
          </div>
        </div>
      </div>

      <div className={styles.upNextCard}>
        <div className={styles.upNextIconWrapper}>
          <AppIcon name="explore" />
        </div>
        <div className={styles.upNextContent}>
          <div className={styles.upNextLabel}>UP NEXT</div>
          <div className={styles.upNextTitle}>Try {topic} next</div>
        </div>
        <AppIcon name="arrow_forward" />
      </div>

      <div className={styles.actions}>
        <Link href="/practice" className={styles.btnPrimary}>
          <AppIcon name="refresh" />
          Practice Again
        </Link>
        <button
          className={styles.btnSecondary}
          onClick={() => setReviewing(true)}
          disabled={questions.length === 0}
        >
          <AppIcon name="rule" />
          Review Mistakes
        </button>
      </div>
    </div>
  );
}

export default function PracticeResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}
