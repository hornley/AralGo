import styles from './results.module.css';
import Link from 'next/link';

export default function PracticeResultsPage() {
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
            <circle cx="50" cy="50" r="40" className={styles.ringProgress} strokeDasharray="251.2" strokeDashoffset="37.68" />
          </svg>
          <div className={styles.scoreContent}>
            <span className={styles.scoreValue}>85%</span>
            <span className={styles.scoreLabel}>SCORE</span>
          </div>
        </div>

        <div className={styles.metricsRow}>
          <div className={styles.metricBox}>
            <span className="material-symbols-outlined">schedule</span>
            <div className={styles.metricLabel}>SPEED</div>
            <div className={styles.metricValue}>2m 45s</div>
          </div>
          <div className={styles.metricBox}>
            <span className="material-symbols-outlined">check_circle</span>
            <div className={styles.metricLabel}>ACCURACY</div>
            <div className={styles.metricValue}>17 / 20</div>
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
          <div className={styles.upNextTitle}>Try Derivative Rules next</div>
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
