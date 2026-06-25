import { getDashboardData } from '@/lib/study/dashboard-data';
import DashboardProfile from './dashboard-profile';
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

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <DashboardProfile
          initialDisplayName={profile?.display_name ?? null}
          initialGradeBand={profile?.grade_band ?? null}
          isAnonymous={Boolean(user?.is_anonymous)}
          greeting={getGreeting()}
        />

        <SidebarNav />
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
