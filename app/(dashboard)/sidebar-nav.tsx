'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppIcon } from '@/components/AppIcon';
import { t } from '@/lib/i18n';
import { useLocalStudySetup } from '@/lib/study/use-local-study-setup';
import styles from './layout.module.css';

const primaryLinks = [
  { href: '/home', icon: 'home', labelKey: 'dashboard.home' },
  { href: '/tutor', icon: 'smart_toy', labelKey: 'dashboard.tutor' },
  { href: '/practice', icon: 'fitness_center', labelKey: 'dashboard.practice' },
  { href: '/lesson-studio', icon: 'auto_stories', labelKey: 'dashboard.lessonStudio' },
  { href: '/history', icon: 'history', labelKey: 'dashboard.history' },
  { href: '/profile', icon: 'person', labelKey: 'dashboard.profile' },
];

const secondaryLinks = [
  { href: '/settings', icon: 'settings', labelKey: 'dashboard.settings' },
  { href: '/help', icon: 'help', labelKey: 'dashboard.help' },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({
  href,
  icon,
  labelKey,
  languageMode,
  onNavigate,
}: {
  href: string;
  icon: string;
  labelKey: string;
  languageMode: string | null | undefined;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link href={href} className={`${styles.navLink} ${active ? styles.active : ''}`} onClick={onNavigate}>
      <AppIcon name={icon} />
      {t(languageMode, labelKey)}
    </Link>
  );
}

export default function SidebarNav({
  initialLanguageMode,
  onNavigate,
}: {
  initialLanguageMode: string | null;
  onNavigate?: () => void;
}) {
  const localSetup = useLocalStudySetup();
  const languageMode = localSetup?.languageMode ?? initialLanguageMode;

  return (
    <>
      <nav className={styles.navSection}>
        {primaryLinks.map((link) => (
          <SidebarLink key={link.href} {...link} languageMode={languageMode} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className={styles.bottomNav}>
        {secondaryLinks.map((link) => (
          <SidebarLink key={link.href} {...link} languageMode={languageMode} onNavigate={onNavigate} />
        ))}
      </div>
    </>
  );
}
