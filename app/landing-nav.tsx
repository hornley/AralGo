'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { loadStudySetup } from '@/lib/study/study-setup';
import styles from './home.module.css';

export function LandingNav() {
  const hasAnsweredOnboarding = useSyncExternalStore(
    subscribeToStorage,
    getOnboardingSnapshot,
    getServerSnapshot,
  );

  return (
    <nav className={styles.topnav} aria-label="Landing page navigation">
      {hasAnsweredOnboarding ? (
        <Link href="/home" className={styles.topnavLink}>
          Home
        </Link>
      ) : null}
      <Link href="#services" className={styles.topnavLink}>
        Services
      </Link>
      <Link href="#about" className={styles.topnavLink}>
        About
      </Link>
    </nav>
  );
}

function subscribeToStorage(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
  };
}

function getOnboardingSnapshot() {
  return Boolean(loadStudySetup());
}

function getServerSnapshot() {
  return false;
}
