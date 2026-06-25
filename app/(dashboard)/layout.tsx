import Link from 'next/link';
import Image from 'next/image';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.profileSection}>
          <div className={styles.avatarWrapper}>
             <Image src="/avatar.png" alt="Avatar" width={80} height={80} className={styles.avatarImage} />
          </div>
          <h2 className={styles.userName}>AralGo Scholar</h2>
          <p className={styles.greeting}>Good afternoon, Juan! 🌱</p>
        </div>

        <nav className={styles.navSection}>
          <Link href="/home" className={`${styles.navLink} ${styles.active}`}>
            <span className="material-symbols-outlined fill">home</span>
            Home
          </Link>
          <Link href="/tutor" className={styles.navLink}>
            <span className="material-symbols-outlined">smart_toy</span>
            Tutor
          </Link>
          <Link href="/practice" className={styles.navLink}>
            <span className="material-symbols-outlined">fitness_center</span>
            Practice
          </Link>
          <Link href="/history" className={styles.navLink}>
            <span className="material-symbols-outlined">history</span>
            History
          </Link>
          <Link href="/profile" className={styles.navLink}>
            <span className="material-symbols-outlined">person</span>
            Profile
          </Link>
        </nav>

        <div className={styles.bottomNav}>
          <Link href="/settings" className={styles.navLink}>
            <span className="material-symbols-outlined">settings</span>
            Settings
          </Link>
          <Link href="/help" className={styles.navLink}>
            <span className="material-symbols-outlined">help</span>
            Help
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
