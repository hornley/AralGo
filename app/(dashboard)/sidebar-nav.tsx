'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

const primaryLinks = [
  { href: '/home', icon: 'home', label: 'Home', fill: true },
  { href: '/tutor', icon: 'smart_toy', label: 'Tutor' },
  { href: '/practice', icon: 'fitness_center', label: 'Practice' },
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
  fill,
}: {
  href: string;
  icon: string;
  label: string;
  fill?: boolean;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);
  const iconClassName = fill || active ? 'material-symbols-outlined fill' : 'material-symbols-outlined';

  return (
    <Link href={href} className={`${styles.navLink} ${active ? styles.active : ''}`}>
      <span className={iconClassName}>{icon}</span>
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
