import Link from 'next/link';
import { AppIcon } from '@/components/AppIcon';
import { getSessionHistory, formatSubject } from '@/lib/study/dashboard-data';
import styles from './history.module.css';

function getSubjectVisual(subject: string) {
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

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffHrs < 48) return 'Yesterday';
  return date.toLocaleDateString();
}

function getSessionTitle(topic: string | null, subjectLabel: string) {
  if (topic && topic.trim()) return topic;
  return `${subjectLabel} session`;
}

function formatStatus(status: string) {
  switch (status) {
    case 'active': return 'Active';
    case 'setup': return 'Started';
    case 'completed': return 'Completed';
    case 'archived': return 'Archived';
    default: return status;
  }
}

function formatLanguage(languageMode: string) {
  switch (languageMode) {
    case 'english': return 'English';
    case 'filipino': return 'Filipino';
    default: return 'Mixed';
  }
}

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const sessions = await getSessionHistory();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Study History</h1>
        <p className={styles.subtitle}>Review your past study sessions and pick up where you left off.</p>
      </header>

      {sessions.length === 0 ? (
        <div className={styles.emptyState}>
          <AppIcon name="history" className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>No study history yet</h2>
          <p className={styles.emptyText}>Start your first AI-guided session to build your study history.</p>
          <Link href="/home" className={styles.cta}>Go to Home</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {sessions.map((session) => {
            const visual = getSubjectVisual(session.subject);
            const subjectLabel = formatSubject(session.subject);
            return (
              <Link
                key={session.id}
                href={`/tutor?sessionId=${session.id}`}
                className={styles.card}
              >
                <div className={styles.cardIcon} data-color={visual.color}>
                  <AppIcon name={visual.icon} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>
                    {getSessionTitle(session.topic, subjectLabel)}
                  </h3>
                  <p className={styles.cardMeta}>
                    {subjectLabel}
                    <span className={styles.dot}>&middot;</span>
                    {formatLanguage(session.language_mode)}
                    <span className={styles.dot}>&middot;</span>
                    <span className={styles.timestamp}>{formatTimestamp(session.last_active_at)}</span>
                  </p>
                </div>
                <div className={styles.cardRight}>
                  <span className={`${styles.statusBadge} ${styles[`status${formatStatus(session.status).toLowerCase()}`] || ''}`}>
                    {formatStatus(session.status)}
                  </span>
                  <AppIcon name="chevron_right" className={styles.arrow} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
