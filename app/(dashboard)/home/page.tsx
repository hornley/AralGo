import { getDashboardData } from '@/lib/study/dashboard-data';
import HomeContent from './home-content';

export default async function Home() {
  const { error, profile, latestSession, topicPerformance, stats } = await getDashboardData();

  return (
    <HomeContent
      error={error}
      profile={profile}
      latestSession={latestSession}
      topicPerformance={topicPerformance}
      stats={stats}
    />
  );
}
