'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';
import styles from './style.module.scss';

interface SidebarProps {
  user?: {
    name: string;
    role: string;
  };
  onLogout?: () => void;
}

export default function Sidebar({ 
  user = { name: 'Saurabh Thapliyal', role: 'Frontend Developer Intern' }, 
  onLogout 
}: SidebarProps) {
  const pathname = usePathname();

  const navLinks = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: LayoutGrid,
      isActive: pathname === '/dashboard',
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderKanban,
      isActive: pathname.startsWith('/projects') && pathname === '/projects',
    },
    {
      name: 'Tasks',
      href: '/projects/proj-1',
      icon: CheckSquare,
      isActive: pathname.startsWith('/projects/') && pathname !== '/projects',
    },
    {
      name: 'Team',
      href: '/dashboard',
      icon: Users,
      isActive: false,
    },
    {
      name: 'Settings',
      href: '/dashboard',
      icon: Settings,
      isActive: false,
    },
  ];

  return (
    <aside className={styles.sidebar} aria-label="Sidebar Navigation">
      {/* Minimal Brand Logo */}
      <div className={styles.brand}>
        <div className={styles.brandLogo}>
          <span className={styles.logoBarPrimary} />
          <span className={styles.logoBarSecondary} />
        </div>
        <span className={styles.brandName}>Axionix</span>
      </div>

      {/* Nav Menu */}
      <nav className={styles.navSection}>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`${styles.navItem} ${link.isActive ? styles.active : ''}`}
              aria-current={link.isActive ? 'page' : undefined}
            >
              <Icon size={18} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Area: Quote & User Profile */}
      <div className={styles.sidebarFooter}>
        <div className={styles.quote}>
          <p>Better systems</p>
          <p>build better teams.</p>
        </div>

        <div className={styles.userCard}>
          <div className={styles.userLeft}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                ST
              </div>
              <span className={styles.onlineDot} />
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>{user.role}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className={styles.logoutBtn}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
