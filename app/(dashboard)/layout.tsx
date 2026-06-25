import Image from 'next/image';
import { formatGradeBand, getDashboardData } from '@/lib/study/dashboard-data';
import SidebarNav from './sidebar-nav';
import styles from './layout.module.css';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, user } = await getDashboardData();
  const displayName = profile?.display_name || 'AralGo Scholar';
  const gradeLabel = profile ? formatGradeBand(profile.grade_band) : 'Guest learner';

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.profileSection}>
          <div className={styles.avatarWrapper}>
             <Image src="/avatar.png" alt="Avatar" width={80} height={80} className={styles.avatarImage} />
          </div>
          <h2 className={styles.userName}>{displayName}</h2>
          <p className={styles.greeting}>
            {getGreeting()}, {gradeLabel}! {user?.is_anonymous ? '🌱' : '✨'}
          </p>
        </div>

        <SidebarNav />
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
