'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppIcon } from '@/components/AppIcon';
import styles from './layout.module.css';

const primaryLinks = [
  { href: '/home', icon: 'home', label: 'Home' },
  { href: '/tutor', icon: 'smart_toy', label: 'Tutor' },
  { href: '/practice', icon: 'fitness_center', label: 'Practice' },
  { href: '/lesson-studio', icon: 'auto_stories', label: 'Lesson Studio' },
  { href: '/history', icon: 'history', label: 'History' },
  { href: '/profile', icon: 'person', label: 'Profile' },
];

const secondaryLinks = [
  { href: '/settings', icon: 'settings', label: 'Settings' },
  { href: '/help', icon: 'help', label: 'Help' },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link href={href} className={`${styles.navLink} ${active ? styles.active : ''}`}>
      <AppIcon name={icon} />
      {label}
    </Link>
  );
}

export default function SidebarNav() {
  return (
    <>
      <nav className={styles.navSection}>
        {primaryLinks.map((link) => (
          <SidebarLink key={link.href} {...link} />
        ))}
      </nav>

      <div className={styles.bottomNav}>
        {secondaryLinks.map((link) => (
          <SidebarLink key={link.href} {...link} />
        ))}
      </div>
    </>
  );
}
