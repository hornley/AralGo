import Link from 'next/link';
import { AppIcon } from '@/components/AppIcon';
import styles from '../placeholder.module.css';

export default function SettingsPage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <AppIcon name="settings" />
          Settings
        </div>
        <h1 className={styles.title}>Settings are consolidated in profile for now.</h1>
        <p className={styles.copy}>
          Language mode, grade band, preferred subject, and study goal are editable today under the profile page.
          This route exists so navigation stays coherent while deeper account settings are still being built.
        </p>
      </section>

      <div className={styles.actions}>
        <Link href="/profile" className={styles.action}>
          <AppIcon name="person" />
          Open profile
        </Link>
      </div>
    </div>
  );
}
