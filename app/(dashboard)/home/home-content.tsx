'use client';

import Link from 'next/link';
import { AppIcon } from '@/components/AppIcon';
import { languageModeLabel, t } from '@/lib/i18n';
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

function getSessionLabel(topic: string | null, subject: string, languageMode: string | null | undefined) {
  if (topic && topic.trim()) {
    return topic;
  }
  if (languageMode === 'filipino') {
    return `Study session sa ${subject}`;
  }
  if (languageMode === 'mixed') {
    return `${subject} study session`;
  }
  return `${subject} study session`;
}

function getGoalHeading(goal: StudySetupDraft['goal'], languageMode: string | null | undefined) {
  switch (goal) {
    case 'Habol':
      return languageMode === 'filipino' ? 'Layuning Humabol' : languageMode === 'mixed' ? 'Catch-up Goal' : 'Catch-up Goal';
    case 'Review':
      return languageMode === 'filipino' ? 'Layuning Mag-review' : 'Review Goal';
    case 'Learn':
      return languageMode === 'filipino' ? 'Layuning Matuto' : 'Learning Goal';
    default:
      return languageMode === 'filipino' ? 'Layunin Ngayon' : languageMode === 'mixed' ? "Today's Goal" : "Today's Goal";
  }
}

function getGoalMessage(
  goal: StudySetupDraft['goal'],
  progress: number,
  completedBlocks: number,
  targetBlocks: number,
  languageMode: string | null | undefined,
) {
  if (progress >= 100) {
    if (languageMode === 'filipino') {
      return 'Natapos mo na ang focus target mo ngayong araw.';
    }
    if (languageMode === 'mixed') {
      return 'Completed na ang focus target mo today.';
    }
    return 'You already completed your focus target today.';
  }

  const remainingBlocks = Math.max(targetBlocks - completedBlocks, 0);

  if (goal === 'Habol') {
    if (languageMode === 'filipino') {
      return remainingBlocks > 0
        ? `${remainingBlocks} study block pa para makahabol ngayong araw.`
        : 'Nasa tamang takbo ka ngayong araw.';
    }
    if (languageMode === 'mixed') {
      return remainingBlocks > 0
        ? `${remainingBlocks} study block pa para makahabol today.`
        : 'On track ka today.';
    }
    return remainingBlocks > 0
      ? `${remainingBlocks} more study block${remainingBlocks === 1 ? '' : 's'} to catch up today.`
      : 'You are on track for today.';
  }

  if (goal === 'Review') {
    if (languageMode === 'filipino') {
      return remainingBlocks > 0
        ? `${remainingBlocks} review block pa ngayong araw.`
        : 'Tapos na ang review target mo ngayong araw.';
    }
    if (languageMode === 'mixed') {
      return remainingBlocks > 0
        ? `${remainingBlocks} review block pa today.`
        : 'Done na ang review target mo today.';
    }
    return remainingBlocks > 0
      ? `${remainingBlocks} review block${remainingBlocks === 1 ? '' : 's'} left today.`
      : 'Your review target is done for today.';
  }

  if (goal === 'Learn') {
    if (languageMode === 'filipino') {
      return remainingBlocks > 0
        ? `${remainingBlocks} learning block pa ngayong araw.`
        : 'Naabot mo na ang learning target mo ngayong araw.';
    }
    if (languageMode === 'mixed') {
      return remainingBlocks > 0
        ? `${remainingBlocks} learning block pa today.`
        : "Naabot mo na today's learning target.";
    }
    return remainingBlocks > 0
      ? `${remainingBlocks} learning block${remainingBlocks === 1 ? '' : 's'} left today.`
      : "You reached today's learning target.";
  }

  if (languageMode === 'filipino') {
    return remainingBlocks > 0
      ? `${remainingBlocks} guided study block pa ngayong araw.`
      : 'Kumpleto na ang naka-save mong study target.';
  }
  if (languageMode === 'mixed') {
    return remainingBlocks > 0
      ? `${remainingBlocks} guided study block pa today.`
      : 'Complete na ang saved study target mo.';
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
  languageMode,
}: {
  profile: DashboardData['profile'];
  latestSession: DashboardData['latestSession'];
  topicPerformance: DashboardData['topicPerformance'];
  goalProgress: number;
  targetBlocks: number;
  completedBlocks: number;
  courseTitle: string;
  languageMode: string | null | undefined;
}) {
  if (!profile) {
    if (languageMode === 'filipino') {
      return 'Tapusin ang onboarding para makagawa ang AralGo ng learner profile at masundan ang progreso mo.';
    }
    if (languageMode === 'mixed') {
      return 'Tapusin ang onboarding para ma-save ng AralGo ang learner profile at progress mo.';
    }
    return 'Finish onboarding so AralGo can keep a learner profile and track your progress over time.';
  }

  if (!latestSession) {
    if (languageMode === 'filipino') {
      return 'Magsimula ng study session para magkaroon ng recent topics, tutor context, at progress history ang dashboard mo.';
    }
    if (languageMode === 'mixed') {
      return 'Start ka ng study session para magkaroon ng recent topics, tutor context, at progress history ang dashboard mo.';
    }
    return 'Start a study session to populate your dashboard with recent topics, tutor context, and progress history.';
  }

  if (topicPerformance) {
    const accuracy = normalizeAccuracy(topicPerformance.rolling_accuracy);
    if (accuracy < 70) {
      if (languageMode === 'filipino') {
        return `${courseTitle} ay nasa ${accuracy}% accuracy ngayon. Magandang susunod na hakbang ang maikling practice set.`;
      }
      if (languageMode === 'mixed') {
        return `${courseTitle} is currently at ${accuracy}% accuracy. Best next step ang short practice set.`;
      }
      return `${courseTitle} is currently at ${accuracy}% accuracy. A short practice set would be the highest-value next step.`;
    }
  }

  if (goalProgress >= 100) {
    if (languageMode === 'filipino') {
      return 'Naabot mo na ang target ngayong araw. Balikan ang recent topic history o magsimula ng bagong subject kung gusto mo pa.';
    }
    if (languageMode === 'mixed') {
      return "Hit mo na today's target. Review recent topic history or start a new subject kung gusto mo pa.";
    }
    return "You already hit today's target. Review your recent topic history or start a new subject if you want another block.";
  }

  const remainingBlocks = Math.max(targetBlocks - completedBlocks, 0);
  if (languageMode === 'filipino') {
    return `${remainingBlocks} study block pa ngayong araw. Ipagpatuloy ang pinakahuling session para umusad ang dashboard.`;
  }
  if (languageMode === 'mixed') {
    return `${remainingBlocks} study block pa today. Continue the latest session para umusad ang dashboard.`;
  }
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
  languageMode,
}: {
  profile: DashboardData['profile'];
  latestSession: DashboardData['latestSession'];
  courseTitle: string;
  subjectLabel: string;
  totalPracticeAttempts: number;
  languageMode: string | null | undefined;
}) {
  return [
    {
      href: getResumeHref(latestSession),
      icon: latestSession ? 'play_arrow' : 'school',
      title: latestSession ? t(languageMode, 'home.continueSession') : t(languageMode, 'home.finishOnboarding'),
      description: latestSession ? courseTitle : t(languageMode, 'home.createProfile'),
      color: 'green',
    },
    {
      href: '/practice',
      icon: 'document_scanner',
      title: t(languageMode, 'home.practiceNow'),
      description:
        languageMode === 'filipino'
          ? `Gumawa ng ${subjectLabel.toLowerCase()} set kapag kailangan.`
          : languageMode === 'mixed'
            ? `Generate ng ${subjectLabel.toLowerCase()} set on demand.`
            : `Generate a ${subjectLabel.toLowerCase()} set on demand.`,
      color: 'brown',
    },
    {
      href: '/history',
      icon: 'history',
      title: t(languageMode, 'home.reviewHistory'),
      description:
        totalPracticeAttempts > 0
          ? languageMode === 'filipino'
            ? `${totalPracticeAttempts} naka-save na practice attempt.`
            : languageMode === 'mixed'
              ? `${totalPracticeAttempts} saved practice attempt${totalPracticeAttempts === 1 ? '' : 's'}.`
              : `${totalPracticeAttempts} saved practice attempt${totalPracticeAttempts === 1 ? '' : 's'}.`
          : t(languageMode, 'home.noPractice'),
      color: 'blue',
    },
    {
      href: profile ? '/profile' : '/onboarding',
      icon: profile ? 'person' : 'settings',
      title: profile ? t(languageMode, 'home.updateProfile') : t(languageMode, 'home.setPreferences'),
      description: profile ? t(languageMode, 'home.adjustPreferences') : t(languageMode, 'home.pickPreferences'),
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
  const languageMode = localSetup?.languageMode ?? profile?.preferred_language_mode ?? latestSession?.language_mode ?? null;
  const primaryTopic = recentTopics[0] ?? null;
  const subject = primaryTopic?.subject ?? localSetup?.subject ?? profile?.preferred_subject ?? 'science';
  const subjectLabel = formatSubject(subject);
  const topic = primaryTopic?.topic ?? localSetup?.topic ?? null;
  const courseTitle = getSessionLabel(topic || null, subjectLabel, languageMode);
  const gradeBand = localSetup?.gradeBand ?? profile?.grade_band ?? null;
  const gradeLabel = gradeBand ? formatGradeBand(gradeBand) : t(languageMode, 'dashboard.guest');
  const goal = localSetup?.goal ?? null;
  const targetBlocks = getGoalTargetBlocks(goal);
  const completedBlocks = stats.todayCompletedSessions + stats.todayPracticeAttempts;
  const goalProgress = getGoalProgress(completedBlocks, targetBlocks);
  const goalMessage = getGoalMessage(goal, goalProgress, completedBlocks, targetBlocks, languageMode);
  const goalTitle = getGoalHeading(goal, languageMode);
  const courseProgress = normalizeAccuracy(topicPerformance?.rolling_accuracy);
  const resumeHref = getResumeHref(latestSession);
  const actionItems = getActionItems({
    profile,
    latestSession,
    courseTitle,
    subjectLabel,
    totalPracticeAttempts: stats.totalPracticeAttempts,
    languageMode,
  });
  const studyTip = getStudyTip({
    profile,
    latestSession,
    topicPerformance,
    goalProgress,
    targetBlocks,
    completedBlocks,
    courseTitle,
    languageMode,
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
                <Link href={resumeHref} className={styles.playButton} aria-label={t(languageMode, 'dashboard.tutor')}>
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
              <div className={styles.goalTotal}>{completedBlocks} / {targetBlocks} {t(languageMode, 'home.studyBlocks')}</div>
            </div>
          </div>
          <div className={styles.goalMessage}>{goalMessage}</div>
        </div>

        <div className={`${styles.card} ${styles.topicsCard}`}>
          <div className={styles.topicsHeader}>
            <h3 className={styles.topicsTitle}>{t(languageMode, 'home.recentTopics')}</h3>
            <Link href="/history" className={styles.viewAll}>
              {t(languageMode, 'home.viewAll')}
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
                        {getSessionLabel(entry.topic, formatSubject(entry.subject), languageMode)}
                      </h4>
                      <p className={styles.topicStatus} data-status="default">
                        {languageModeLabel(entry.languageMode)} • {formatTopicTimestamp(entry.savedAt)}
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
                  <h4 className={styles.topicName}>{t(languageMode, 'home.noTopics')}</h4>
                  <p className={styles.topicStatus} data-status="warning">
                    {t(languageMode, 'home.noTopicsHint')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div>
          <h3 className={styles.sectionTitle}>{t(languageMode, 'home.quickActions')}</h3>
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
            <h4 className={styles.tipTitle}>{t(languageMode, 'home.nextBestStep')}</h4>
            <p className={styles.tipText}>
              {studyTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
