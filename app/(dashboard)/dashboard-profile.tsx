'use client';

import Image from 'next/image';
import { t } from '@/lib/i18n';
import { formatGradeBand } from '@/lib/study/format';
import { useLocalStudySetup } from '@/lib/study/use-local-study-setup';
import styles from './layout.module.css';

type DashboardProfileProps = {
  initialDisplayName: string | null;
  initialGradeBand: string | null;
  initialLanguageMode: string | null;
  isAnonymous: boolean;
  greeting: string;
};

export default function DashboardProfile({
  initialDisplayName,
  initialGradeBand,
  initialLanguageMode,
  isAnonymous,
  greeting,
}: DashboardProfileProps) {
  const localSetup = useLocalStudySetup();
  const languageMode = localSetup?.languageMode ?? initialLanguageMode;
  const displayName = localSetup?.displayName || initialDisplayName || t(languageMode, 'dashboard.learner');
  const gradeLabel = localSetup
    ? formatGradeBand(localSetup.gradeBand)
    : initialGradeBand
      ? formatGradeBand(initialGradeBand)
      : t(languageMode, 'dashboard.guest');

  return (
    <div className={styles.profileSection}>
      <div className={styles.avatarWrapper}>
        <Image src="/images/avatar.png" alt="Avatar" width={80} height={80} className={styles.avatarImage} />
      </div>
      <h2 className={styles.userName}>{displayName}</h2>
      <p className={styles.greeting}>
        {greeting}, {gradeLabel}! {isAnonymous ? '🌱' : '✨'}
      </p>
    </div>
  );
}
