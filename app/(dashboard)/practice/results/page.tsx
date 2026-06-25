'use client';

import styles from './results.module.css';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResultsContent() {
  const params = useSearchParams();

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
            <circle
              cx="50" cy="50" r="40"
              className={styles.ringProgress}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className={styles.scoreContent}>
            <span className={styles.scoreValue}>{score}%</span>
            <span className={styles.scoreLabel}>SCORE</span>
          </div>
        </div>

        <div className={styles.metricsRow}>
          <div className={styles.metricBox}>
            <span className="material-symbols-outlined">schedule</span>
            <div className={styles.metricLabel}>SPEED</div>
            <div className={styles.metricValue}>{formattedTime}</div>
          </div>
          <div className={styles.metricBox}>
            <span className="material-symbols-outlined">check_circle</span>
            <div className={styles.metricLabel}>ACCURACY</div>
            <div className={styles.metricValue}>{correct} / {total}</div>
          </div>
        </div>

        <div className={styles.streakBox}>
          <span className={`material-symbols-outlined ${styles.streakIcon}`}>local_fire_department</span>
          <div>
            <div className={styles.metricLabel}>STREAK</div>
            <div className={styles.metricValue}>Unbroken</div>
          </div>
        </div>
      </div>

      <div className={styles.upNextCard}>
        <div className={styles.upNextIconWrapper}>
           <span className="material-symbols-outlined">explore</span>
        </div>
        <div className={styles.upNextContent}>
          <div className={styles.upNextLabel}>UP NEXT</div>
          <div className={styles.upNextTitle}>Try {topic} next</div>
        </div>
        <span className="material-symbols-outlined">arrow_forward</span>
      </div>

      <div className={styles.actions}>
        <Link href="/practice" className={styles.btnPrimary}>
          <span className="material-symbols-outlined">refresh</span>
          Practice Again
        </Link>
        <button className={styles.btnSecondary}>
          <span className="material-symbols-outlined">rule</span>
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
