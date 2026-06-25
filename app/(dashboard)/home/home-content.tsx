'use client';

import Link from 'next/link';
import type { DashboardData } from '@/lib/study/dashboard-data';
import { formatGradeBand, formatSubject } from '@/lib/study/format';
import {
  createRecentStudyTopic,
  goalMinutesFromGoal,
  type RecentStudyTopic,
  type StudySetupDraft,
} from '@/lib/study/study-setup';
import { useLocalStudySetup } from '@/lib/study/use-local-study-setup';
import styles from './home.module.css';

type HomeContentProps = {
  error: string | null;
  profile: DashboardData['profile'];
  latestSession: DashboardData['latestSession'];
};

function formatLanguageMode(languageMode: string) {
  switch (languageMode) {
    case 'english':
      return 'English';
    case 'filipino':
      return 'Filipino';
    default:
      return 'Mixed';
  }
}

function getSessionLabel(topic: string | null, subject: string) {
  if (topic && topic.trim()) {
    return topic;
  }
  return `${subject} study session`;
}

function getGoalHeading(goal: StudySetupDraft['goal']) {
  switch (goal) {
    case 'Habol':
      return 'Catch-up Goal';
    case 'Review':
      return 'Review Goal';
    case 'Learn':
      return 'Learning Goal';
    default:
      return "Today's Goal";
  }
}

function getGoalMessage(goal: StudySetupDraft['goal'], progress: number, hasActivity: boolean) {
  if (progress >= 100) {
    return 'You already completed your focus target today.';
  }

  if (goal === 'Habol') {
    return hasActivity ? 'Keep going. One more focused block helps you catch up.' : 'Start one guided catch-up session on this device.';
  }

  if (goal === 'Review') {
    return hasActivity ? 'Your review session is in progress.' : 'Begin a short review block to build recall.';
  }

  if (goal === 'Learn') {
    return hasActivity ? 'You have momentum. Continue learning from your last topic.' : 'Start a short learning session and keep it consistent.';
  }

  return hasActivity ? 'Your saved study setup is ready offline.' : 'Finish onboarding and start your first guided session.';
}

function getGoalProgress(status: RecentStudyTopic['status'] | null) {
  switch (status) {
    case 'completed':
      return 100;
    case 'active':
      return 70;
    case 'setup':
      return 30;
    case 'archived':
      return 10;
    default:
      return 0;
  }
}

function formatTopicTimestamp(savedAt: string | null) {
  if (!savedAt) {
    return 'Saved on this device';
  }

  const parsed = new Date(savedAt);
  if (Number.isNaN(parsed.getTime())) {
    return 'Saved on this device';
  }

  return `Saved ${parsed.toLocaleDateString()}`;
}

function getTopicVisual(subject: RecentStudyTopic['subject']) {
  switch (subject) {
    case 'mathematics':
      return { icon: 'calculate', color: 'green' };
    case 'english':
      return { icon: 'menu_book', color: 'brown' };
    case 'filipino':
      return { icon: 'import_contacts', color: 'blue' };
    default:
      return { icon: 'science', color: 'red' };
  }
}

function normalizeRecentTopics(
  localSetup: StudySetupDraft | null,
  latestSession: DashboardData['latestSession'],
  profile: DashboardData['profile'],
) {
  const topics: RecentStudyTopic[] = [];

  if (latestSession) {
    topics.push({
      subject: latestSession.subject,
      topic: latestSession.topic ?? '',
      languageMode: latestSession.language_mode,
      gradeBand: localSetup?.gradeBand ?? profile?.grade_band ?? 'junior_high',
      status: latestSession.status,
      savedAt: latestSession.last_active_at,
    });
  }

  if (localSetup?.recentTopics?.length) {
    topics.push(...localSetup.recentTopics);
  } else if (localSetup) {
    topics.push(
      createRecentStudyTopic(localSetup, {
        status: 'setup',
      }),
    );
  }

  const deduped = topics.filter((topic, index) => {
    const key = `${topic.subject}:${topic.topic.toLowerCase()}:${topic.gradeBand}`;

    return (
      topics.findIndex(
        (candidate) =>
          `${candidate.subject}:${candidate.topic.toLowerCase()}:${candidate.gradeBand}` === key,
      ) === index
    );
  });

  return deduped.slice(0, 3);
}

export default function HomeContent({ error, profile, latestSession }: HomeContentProps) {
  const localSetup = useLocalStudySetup();
  const recentTopics = normalizeRecentTopics(localSetup, latestSession, profile);
  const primaryTopic = recentTopics[0] ?? null;
  const subject = primaryTopic?.subject ?? localSetup?.subject ?? profile?.preferred_subject ?? 'science';
  const subjectLabel = formatSubject(subject);
  const topic = primaryTopic?.topic ?? localSetup?.topic ?? null;
  const courseTitle = getSessionLabel(topic || null, subjectLabel);
  const gradeBand = localSetup?.gradeBand ?? profile?.grade_band ?? null;
  const gradeLabel = gradeBand ? formatGradeBand(gradeBand) : 'Guest learner';
  const goal = localSetup?.goal ?? null;
  const goalMinutes = localSetup?.dailyGoalMinutes ?? goalMinutesFromGoal(goal);
  const goalProgress = getGoalProgress(primaryTopic?.status ?? null);
  const goalMessage = getGoalMessage(goal, goalProgress, Boolean(primaryTopic));
  const goalTitle = getGoalHeading(goal);

  return (
    <div className={styles.container}>
      {error ? (
        <div className={styles.alert} role="status">
          <span className="material-symbols-outlined">info</span>
          {error}
        </div>
      ) : null}

      <div className={styles.topRow}>
        <div className={`${styles.card} ${styles.courseCard}`}>
          <div className={styles.courseHeader}>
            <span className={styles.courseTag}>{subjectLabel}</span>
            <button className={styles.playButton} aria-label="Continue course">
              <span className="material-symbols-outlined fill">play_arrow</span>
            </button>
          </div>
          <h3 className={styles.courseTitle}>{courseTitle}</h3>
          <p className={styles.courseSubtitle}>
            {primaryTopic
              ? `${gradeLabel} • ${primaryTopic.status} session`
              : `${gradeLabel} • Start your first AI-guided session`}
          </p>

          <div className={styles.courseProgress}>
            <div
              className={styles.progressCircleSmall}
              style={{ background: `conic-gradient(#4A6741 ${goalProgress}%, #EAF0E5 0)` }}
            >
              <span className={styles.progressValue}>{goalProgress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${goalProgress}%` }}></div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.goalCard}`}>
          <h3 className={styles.goalTitle}>{goalTitle}</h3>
          <div
            className={styles.goalCircle}
            style={{ background: `conic-gradient(#8CBA80 ${goalProgress}%, #E7E2DA 0)` }}
          >
            <div className={styles.goalContent}>
              <div className={styles.goalValue}>{goalProgress}%</div>
              <div className={styles.goalTotal}>{goalMinutes} mins target</div>
            </div>
          </div>
          <div className={styles.goalMessage}>{goalMessage}</div>
        </div>

        <div className={`${styles.card} ${styles.topicsCard}`}>
          <div className={styles.topicsHeader}>
            <h3 className={styles.topicsTitle}>Recent Topics</h3>
            <Link href="/history" className={styles.viewAll}>
              View All
            </Link>
          </div>
          <div className={styles.topicsList}>
            {recentTopics.length > 0 ? (
              recentTopics.map((entry, index) => {
                const visual = getTopicVisual(entry.subject);
                return (
                  <div className={styles.topicItem} key={`${entry.subject}-${entry.topic}-${entry.savedAt}-${index}`}>
                    <div className={styles.topicIcon} data-color={visual.color}>
                      <span className="material-symbols-outlined">{visual.icon}</span>
                    </div>
                    <div className={styles.topicInfo}>
                      <h4 className={styles.topicName}>
                        {getSessionLabel(entry.topic, formatSubject(entry.subject))}
                      </h4>
                      <p className={styles.topicStatus} data-status="default">
                        {formatLanguageMode(entry.languageMode)} • {formatTopicTimestamp(entry.savedAt)}
                      </p>
                    </div>
                    <span className={`material-symbols-outlined ${styles.topicArrow}`}>chevron_right</span>
                  </div>
                );
              })
            ) : (
              <div className={styles.topicItem}>
                <div className={styles.topicIcon} data-color="brown">
                  <span className="material-symbols-outlined">history</span>
                </div>
                <div className={styles.topicInfo}>
                  <h4 className={styles.topicName}>No saved topics yet</h4>
                  <p className={styles.topicStatus} data-status="warning">
                    Finish onboarding or start a session to build your history.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div>
          <h3 className={styles.sectionTitle}>Quick Actions</h3>
          <div className={styles.actionsGrid}>
            <button className={styles.actionBtn}>
              <div className={styles.actionBtnIcon} data-color="green">
                <span className="material-symbols-outlined">document_scanner</span>
              </div>
              <span className={styles.actionBtnLabel}>Scan<br />Homework</span>
            </button>
            <button className={styles.actionBtn}>
              <div className={styles.actionBtnIcon} data-color="brown">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <span className={styles.actionBtnLabel}>Ask<br />AI</span>
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
              <span className={styles.actionBtnLabel}>Add<br />Shortcut</span>
            </button>
          </div>
        </div>

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
