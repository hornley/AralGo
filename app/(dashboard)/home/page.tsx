import Link from 'next/link';
import styles from './home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      
      {/* Top Row Cards */}
      <div className={styles.topRow}>
        
        {/* Course Progress Card */}
        <div className={`${styles.card} ${styles.courseCard}`}>
          <div className={styles.courseHeader}>
            <span className={styles.courseTag}>Mathematics</span>
            <button className={styles.playButton} aria-label="Continue course">
              <span className="material-symbols-outlined fill">play_arrow</span>
            </button>
          </div>
          <h3 className={styles.courseTitle}>Algebra: Linear Equations</h3>
          <p className={styles.courseSubtitle}>Chapter 4 • 2 lessons remaining</p>
          
          <div className={styles.courseProgress}>
            <div className={styles.progressCircleSmall}>
              <span className={styles.progressValue}>65%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}></div>
            </div>
          </div>
        </div>

        {/* Goal Card */}
        <div className={`${styles.card} ${styles.goalCard}`}>
          <h3 className={styles.goalTitle}>Today&apos;s Goal</h3>
          <div className={styles.goalCircle}>
            <div className={styles.goalContent}>
              <div className={styles.goalValue}>30</div>
              <div className={styles.goalTotal}>/ 60 mins</div>
            </div>
          </div>
          <div className={styles.goalMessage}>
            Halfway there! Keep going!
          </div>
        </div>

        {/* Recent Topics Card */}
        <div className={`${styles.card} ${styles.topicsCard}`}>
          <div className={styles.topicsHeader}>
            <h3 className={styles.topicsTitle}>Recent Topics</h3>
            <Link href="/history" className={styles.viewAll}>
              View All
            </Link>
          </div>
          <div className={styles.topicsList}>
            
            <div className={styles.topicItem}>
              <div className={styles.topicIcon} data-color="red">
                <span className="material-symbols-outlined">science</span>
              </div>
              <div className={styles.topicInfo}>
                <h4 className={styles.topicName}>Biology</h4>
                <p className={styles.topicStatus} data-status="warning">Needs review</p>
              </div>
              <span className={`material-symbols-outlined ${styles.topicArrow}`}>chevron_right</span>
            </div>

            <div className={styles.topicItem}>
              <div className={styles.topicIcon} data-color="brown">
                <span className="material-symbols-outlined">history_edu</span>
              </div>
              <div className={styles.topicInfo}>
                <h4 className={styles.topicName}>History</h4>
                <p className={styles.topicStatus} data-status="default">Practice due</p>
              </div>
              <span className={`material-symbols-outlined ${styles.topicArrow}`}>chevron_right</span>
            </div>

            <div className={styles.topicItem}>
              <div className={styles.topicIcon} data-color="blue">
                <span className="material-symbols-outlined">rocket_launch</span>
              </div>
              <div className={styles.topicInfo}>
                <h4 className={styles.topicName}>Physics</h4>
                <p className={styles.topicStatus} data-status="default">Almost done</p>
              </div>
              <span className={`material-symbols-outlined ${styles.topicArrow}`}>chevron_right</span>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className={styles.bottomRow}>
        
        {/* Quick Actions */}
        <div>
          <h3 className={styles.sectionTitle}>Quick Actions</h3>
          <div className={styles.actionsGrid}>
            <button className={styles.actionBtn}>
              <div className={styles.actionBtnIcon} data-color="green">
                <span className="material-symbols-outlined">document_scanner</span>
              </div>
              <span className={styles.actionBtnLabel}>Scan<br/>Homework</span>
            </button>
            <button className={styles.actionBtn}>
              <div className={styles.actionBtnIcon} data-color="brown">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <span className={styles.actionBtnLabel}>Ask<br/>AI</span>
            </button>
            <button className={styles.actionBtn}>
              <div className={styles.actionBtnIcon} data-color="blue">
                <span className="material-symbols-outlined">style</span>
              </div>
              <span className={styles.actionBtnLabel}>Flashcards</span>
            </button>
            <button className={`${styles.actionBtn} ${styles.actionBtnDashed}`}>
              <div className={styles.actionBtnIcon}>
                <span className="material-symbols-outlined">add</span>
              </div>
              <span className={styles.actionBtnLabel}>Add<br/>Shortcut</span>
            </button>
          </div>
        </div>

        {/* Study Tip */}
        <div className={styles.tipCard}>
          <span className={`material-symbols-outlined ${styles.tipIcon}`}>lightbulb</span>
          <div className={styles.tipContent}>
            <h4 className={styles.tipTitle}>Study Tip</h4>
            <p className={styles.tipText}>
              Taking 5-minute breaks every 25 minutes helps improve focus and retention. Try the Pomodoro technique today!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
