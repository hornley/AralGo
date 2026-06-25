'use client';

import Link from 'next/link';
import { AppIcon } from '@/components/AppIcon';
import type { DashboardData } from '@/lib/study/dashboard-data';
import { formatGradeBand, formatSubject } from '@/lib/study/format';
import {
  createRecentStudyTopic,
  type RecentStudyTopic,
  type StudySetupDraft,
} from '@/lib/study/study-setup';
import { useLocalStudySetup } from '@/lib/study/use-local-study-setup';
import styles from './home.module.css';

type HomeContentProps = {
  error: string | null;
  profile: DashboardData['profile'];
  latestSession: DashboardData['latestSession'];
  topicPerformance: DashboardData['topicPerformance'];
  stats: DashboardData['stats'];
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

function getGoalMessage(goal: StudySetupDraft['goal'], progress: number, completedBlocks: number, targetBlocks: number) {
  if (progress >= 100) {
    return 'You already completed your focus target today.';
  }

  const remainingBlocks = Math.max(targetBlocks - completedBlocks, 0);

  if (goal === 'Habol') {
    return remainingBlocks > 0
      ? `${remainingBlocks} more study block${remainingBlocks === 1 ? '' : 's'} to catch up today.`
      : 'You are on track for today.';
  }

  if (goal === 'Review') {
    return remainingBlocks > 0
      ? `${remainingBlocks} review block${remainingBlocks === 1 ? '' : 's'} left today.`
      : 'Your review target is done for today.';
  }

  if (goal === 'Learn') {
    return remainingBlocks > 0
      ? `${remainingBlocks} learning block${remainingBlocks === 1 ? '' : 's'} left today.`
      : "You reached today's learning target.";
  }

  return remainingBlocks > 0
    ? `${remainingBlocks} guided study block${remainingBlocks === 1 ? '' : 's'} left today.`
    : 'Your saved study target is complete.';
}

function getGoalTargetBlocks(goal: StudySetupDraft['goal']) {
  switch (goal) {
    case 'Habol':
      return 3;
    case 'Review':
      return 2;
    case 'Learn':
      return 1;
    default:
      return 1;
  }
}

function getGoalProgress(completedBlocks: number, targetBlocks: number) {
  if (targetBlocks <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((completedBlocks / targetBlocks) * 100));
}

function normalizeAccuracy(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  if (value <= 1) {
    return Math.round(value * 100);
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function getStudyTip({
  profile,
  latestSession,
  topicPerformance,
  goalProgress,
  targetBlocks,
  completedBlocks,
  courseTitle,
}: {
  profile: DashboardData['profile'];
  latestSession: DashboardData['latestSession'];
  topicPerformance: DashboardData['topicPerformance'];
  goalProgress: number;
  targetBlocks: number;
  completedBlocks: number;
  courseTitle: string;
}) {
  if (!profile) {
    return 'Finish onboarding so AralGo can keep a learner profile and track your progress over time.';
  }

  if (!latestSession) {
    return 'Start a study session to populate your dashboard with recent topics, tutor context, and progress history.';
  }

  if (topicPerformance) {
    const accuracy = normalizeAccuracy(topicPerformance.rolling_accuracy);
    if (accuracy < 70) {
      return `${courseTitle} is currently at ${accuracy}% accuracy. A short practice set would be the highest-value next step.`;
    }
  }

  if (goalProgress >= 100) {
    return "You already hit today's target. Review your recent topic history or start a new subject if you want another block.";
  }

  const remainingBlocks = Math.max(targetBlocks - completedBlocks, 0);
  return `${remainingBlocks} study block${remainingBlocks === 1 ? '' : 's'} left today. Continue the latest session to move the dashboard forward.`;
}

function getResumeHref(latestSession: DashboardData['latestSession']) {
  if (!latestSession) {
    return '/onboarding';
  }

  return `/tutor?sessionId=${latestSession.id}`;
}

function getActionItems({
  profile,
  latestSession,
  courseTitle,
  subjectLabel,
  totalPracticeAttempts,
}: {
  profile: DashboardData['profile'];
  latestSession: DashboardData['latestSession'];
  courseTitle: string;
  subjectLabel: string;
  totalPracticeAttempts: number;
}) {
  return [
    {
      href: getResumeHref(latestSession),
      icon: latestSession ? 'play_arrow' : 'school',
      title: latestSession ? 'Continue session' : 'Finish onboarding',
      description: latestSession ? courseTitle : 'Create your learner profile first.',
      color: 'green',
    },
    {
      href: '/practice',
      icon: 'document_scanner',
      title: 'Practice now',
      description: `Generate a ${subjectLabel.toLowerCase()} set on demand.`,
      color: 'brown',
    },
    {
      href: '/history',
      icon: 'history',
      title: 'Review history',
      description:
        totalPracticeAttempts > 0
          ? `${totalPracticeAttempts} saved practice attempt${totalPracticeAttempts === 1 ? '' : 's'}.`
          : 'No saved practice attempts yet.',
      color: 'blue',
    },
    {
      href: profile ? '/profile' : '/onboarding',
      icon: profile ? 'person' : 'settings',
      title: profile ? 'Update profile' : 'Set preferences',
      description: profile ? 'Adjust language, grade, and subject.' : 'Pick your language mode and grade band.',
      color: 'green',
    },
  ] as const;
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

export default function HomeContent({ error, profile, latestSession, topicPerformance, stats }: HomeContentProps) {
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
  const targetBlocks = getGoalTargetBlocks(goal);
  const completedBlocks = stats.todayCompletedSessions + stats.todayPracticeAttempts;
  const goalProgress = getGoalProgress(completedBlocks, targetBlocks);
  const goalMessage = getGoalMessage(goal, goalProgress, completedBlocks, targetBlocks);
  const goalTitle = getGoalHeading(goal);
  const courseProgress = normalizeAccuracy(topicPerformance?.rolling_accuracy);
  const resumeHref = getResumeHref(latestSession);
  const actionItems = getActionItems({
    profile,
    latestSession,
    courseTitle,
    subjectLabel,
    totalPracticeAttempts: stats.totalPracticeAttempts,
  });
  const studyTip = getStudyTip({
    profile,
    latestSession,
    topicPerformance,
    goalProgress,
    targetBlocks,
    completedBlocks,
    courseTitle,
  });

  return (
    <div className={styles.container}>
      {error ? (
        <div className={styles.alert} role="status">
          <AppIcon name="info" />
          {error}
        </div>
      ) : null}

      <div className={styles.topRow}>
        {latestSession ? (
          <div className={`${styles.card} ${styles.courseCard}`}>
            <div className={styles.courseHeader}>
              <span className={styles.courseTag}>{subjectLabel}</span>
              <Link href={resumeHref} className={styles.playButton} aria-label="Continue course">
                <AppIcon name="play_arrow" />
              </Link>
            </div>
            <h3 className={styles.courseTitle}>{courseTitle}</h3>
            <p className={styles.courseSubtitle}>
              {topicPerformance
                ? `${gradeLabel} • ${courseProgress}% latest accuracy`
                : `${gradeLabel} • ${primaryTopic?.status ?? 'active'} session`}
            </p>

            <div className={styles.courseProgress}>
              <div
                className={styles.progressCircleSmall}
                style={{ background: `conic-gradient(#4A6741 ${courseProgress}%, #EAF0E5 0)` }}
              >
                <span className={styles.progressValue}>{courseProgress}%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${courseProgress}%` }}></div>
              </div>
            </div>
          </div>
        ) : null}

        <div className={`${styles.card} ${styles.goalCard}`}>
          <h3 className={styles.goalTitle}>{goalTitle}</h3>
          <div
            className={styles.goalCircle}
            style={{ background: `conic-gradient(#8CBA80 ${goalProgress}%, #E7E2DA 0)` }}
          >
            <div className={styles.goalContent}>
              <div className={styles.goalValue}>{goalProgress}%</div>
              <div className={styles.goalTotal}>{completedBlocks} / {targetBlocks} study blocks</div>
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
                      <AppIcon name={visual.icon} />
                    </div>
                    <div className={styles.topicInfo}>
                      <h4 className={styles.topicName}>
                        {getSessionLabel(entry.topic, formatSubject(entry.subject))}
                      </h4>
                      <p className={styles.topicStatus} data-status="default">
                        {formatLanguageMode(entry.languageMode)} • {formatTopicTimestamp(entry.savedAt)}
                      </p>
                    </div>
                    <AppIcon name="chevron_right" className={styles.topicArrow} />
                  </div>
                );
              })
            ) : (
              <div className={styles.topicItem}>
                <div className={styles.topicIcon} data-color="brown">
                  <AppIcon name="history" />
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
            {actionItems.map((item) => (
              <Link key={item.title} href={item.href} className={styles.actionBtn}>
                <div className={styles.actionBtnIcon} data-color={item.color}>
                  <AppIcon name={item.icon} />
                </div>
                <span className={styles.actionBtnLabel}>{item.title}</span>
                <span className={styles.actionBtnMeta}>{item.description}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.tipCard}>
          <AppIcon name="lightbulb" className={styles.tipIcon} />
          <div className={styles.tipContent}>
            <h4 className={styles.tipTitle}>Next Best Step</h4>
            <p className={styles.tipText}>
              {studyTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
