import { getDashboardData } from '@/lib/study/dashboard-data';
import DashboardShell from './dashboard-shell';

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
    <DashboardShell
      displayName={profile?.display_name ?? null}
      gradeBand={profile?.grade_band ?? null}
      isAnonymous={Boolean(user?.is_anonymous)}
      greeting={getGreeting()}
    >
      {children}
    </DashboardShell>
  );
}
