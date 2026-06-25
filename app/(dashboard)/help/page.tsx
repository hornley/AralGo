import Link from 'next/link';
import { AppIcon } from '@/components/AppIcon';
import styles from '../placeholder.module.css';

export default function HelpPage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <AppIcon name="help" />
          Help
        </div>
        <h1 className={styles.title}>Support guidance is available, even before the full help center.</h1>
        <p className={styles.copy}>
          Use onboarding to create a learner profile, profile to adjust study preferences, tutor for live AI help,
          and practice for generated drills. This page now gives the app a valid target instead of a 404.
        </p>
      </section>

      <section className={styles.panelGrid}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Need to start over?</h2>
          <p className={styles.panelBody}>Go back through onboarding to refresh the learner setup saved on this device.</p>
        </article>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Need to change preferences?</h2>
          <p className={styles.panelBody}>Use the profile page to update language mode, grade band, and preferred subject.</p>
        </article>
      </section>

      <div className={styles.actions}>
        <Link href="/onboarding" className={styles.action}>
          <AppIcon name="school" />
          Open onboarding
        </Link>
        <Link href="/profile" className={`${styles.action} ${styles.actionSecondary}`}>
          <AppIcon name="person" />
          Open profile
        </Link>
      </div>
    </div>
  );
}
