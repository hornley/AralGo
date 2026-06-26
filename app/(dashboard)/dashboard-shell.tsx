'use client';

import { useState } from 'react';
import { AppIcon } from '@/components/AppIcon';
import NetworkBanner from '@/components/NetworkBanner';
import DashboardProfile from './dashboard-profile';
import SidebarNav from './sidebar-nav';
import styles from './layout.module.css';

type DashboardShellProps = {
  children: React.ReactNode;
  displayName: string | null;
  gradeBand: string | null;
  isAnonymous: boolean;
  greeting: string;
};

export default function DashboardShell({
  children,
  displayName,
  gradeBand,
  isAnonymous,
  greeting,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layoutContainer} data-sidebar-open={sidebarOpen ? 'true' : 'false'}>
      <button
        className={styles.mobileMenuButton}
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open dashboard navigation"
        aria-expanded={sidebarOpen}
      >
        <AppIcon name="list_alt" />
        <span>Menu</span>
      </button>

      <button
        className={styles.sidebarOverlay}
        type="button"
        aria-label="Close dashboard navigation"
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={styles.sidebar}>
        <div className={styles.mobileSidebarHeader}>
          <span>AralGo</span>
          <button
            className={styles.closeSidebarButton}
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close dashboard navigation"
          >
            <AppIcon name="close" />
          </button>
        </div>

        <DashboardProfile
          initialDisplayName={displayName}
          initialGradeBand={gradeBand}
          isAnonymous={isAnonymous}
          greeting={greeting}
        />

        <SidebarNav onNavigate={() => setSidebarOpen(false)} />
      </aside>

      <main className={styles.mainContent}>
        <NetworkBanner />
        {children}
      </main>
    </div>
  );
}
