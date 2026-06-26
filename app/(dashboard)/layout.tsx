import { t } from '@/lib/i18n';
import { getDashboardData } from '@/lib/study/dashboard-data';
import DashboardShell from './dashboard-shell';

function getGreeting(languageMode: string | null | undefined) {
  const hour = new Date().getHours();
  if (hour < 12) {
    return t(languageMode, 'dashboard.greeting.morning');
  }
  if (hour < 18) {
    return t(languageMode, 'dashboard.greeting.afternoon');
  }
  return t(languageMode, 'dashboard.greeting.evening');
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, user } = await getDashboardData();
  const languageMode = profile?.preferred_language_mode ?? null;

  return (
    <DashboardShell
      displayName={profile?.display_name ?? null}
      gradeBand={profile?.grade_band ?? null}
      languageMode={languageMode}
      isAnonymous={Boolean(user?.is_anonymous)}
      greeting={getGreeting(languageMode)}
    >
      {children}
    </DashboardShell>
  );
}
