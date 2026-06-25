import Link from 'next/link';
import { formatGradeBand, formatSubject, getDashboardData } from '@/lib/study/dashboard-data';
import styles from './home.module.css';

function getSessionLabel(topic: string | null, subject: string) {
  if (topic) {
    return topic;
  }
  return `${subject} study session`;
}

function getGoalMinutes(profileExists: boolean) {
  return profileExists ? 30 : 10;
}

function getGoalProgress(latestSessionExists: boolean) {
  return latestSessionExists ? 50 : 15;
}

export default async function Home() {
  const { error, profile, latestSession, recentLessons } = await getDashboardData();
  const subjectLabel = formatSubject(latestSession?.subject ?? profile?.preferred_subject ?? "science");
  const courseTitle = getSessionLabel(latestSession?.topic ?? null, subjectLabel);
  const gradeLabel = profile ? formatGradeBand(profile.grade_band) : "Guest learner";
  const goalMinutes = getGoalMinutes(Boolean(profile));
  const goalProgress = getGoalProgress(Boolean(latestSession));
  const goalMessage = latestSession
    ? "Your latest session is ready to continue."
    : "Finish onboarding and start your first guided session.";

  return (
    <div className={styles.container}>
      {error ? (
        <div className={styles.alert} role="status">
          <span className="material-symbols-outlined">info</span>
          {error}
        </div>
      ) : null}

      
      {/* Top Row Cards */}
      <div className={styles.topRow}>
        
        {/* Course Progress Card */}
        <div className={`${styles.card} ${styles.courseCard}`}>
          <div className={styles.courseHeader}>
            <span className={styles.courseTag}>{subjectLabel}</span>
            <button className={styles.playButton} aria-label="Continue course">
              <span className="material-symbols-outlined fill">play_arrow</span>
            </button>
          </div>
          <h3 className={styles.courseTitle}>{courseTitle}</h3>
          <p className={styles.courseSubtitle}>
            {latestSession
              ? `${gradeLabel} • ${latestSession.status} session`
              : `${gradeLabel} • Start your first AI-guided session`}
          </p>
          
          <div className={styles.courseProgress}>
            <div className={styles.progressCircleSmall}>
              <span className={styles.progressValue}>{goalProgress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${goalProgress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Goal Card */}
        <div className={`${styles.card} ${styles.goalCard}`}>
          <h3 className={styles.goalTitle}>Today&apos;s Goal</h3>
          <div className={styles.goalCircle}>
            <div className={styles.goalContent}>
              <div className={styles.goalValue}>{goalMinutes}</div>
              <div className={styles.goalTotal}>/ 60 mins</div>
            </div>
          </div>
          <div className={styles.goalMessage}>
            {goalMessage}
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
                <h4 className={styles.topicName}>{courseTitle}</h4>
                <p className={styles.topicStatus} data-status={latestSession ? "default" : "warning"}>
                  {latestSession ? `Last active ${new Date(latestSession.last_active_at).toLocaleDateString()}` : 'No saved sessions yet'}
                </p>
              </div>
              <span className={`material-symbols-outlined ${styles.topicArrow}`}>chevron_right</span>
            </div>

            <div className={styles.topicItem}>
              <div className={styles.topicIcon} data-color="brown">
                <span className="material-symbols-outlined">translate</span>
              </div>
              <div className={styles.topicInfo}>
                <h4 className={styles.topicName}>Language mode</h4>
                <p className={styles.topicStatus} data-status="default">
                  {profile ? profile.preferred_language_mode : 'Mixed'}
                </p>
              </div>
              <span className={`material-symbols-outlined ${styles.topicArrow}`}>chevron_right</span>
            </div>

            <div className={styles.topicItem}>
              <div className={styles.topicIcon} data-color="blue">
                <span className="material-symbols-outlined">school</span>
              </div>
              <div className={styles.topicInfo}>
                <h4 className={styles.topicName}>Grade band</h4>
                <p className={styles.topicStatus} data-status="default">{gradeLabel}</p>
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
            <Link href="/lesson-studio" className={styles.actionBtn}>
              <div className={styles.actionBtnIcon} data-color="green">
                <span className="material-symbols-outlined">auto_stories</span>
              </div>
              <span className={styles.actionBtnLabel}>Create<br/>Lesson</span>
            </Link>
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
