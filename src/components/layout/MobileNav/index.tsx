'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity,
  Inbox,
  CheckCircle2,
  GitPullRequest,
  Compass,
  FolderKanban,
  Bot,
  BarChart3,
  Palette,
  Circle,
  X, 
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/format';
import AxionixLogo from '@/components/ui/Logo';
import styles from './style.module.scss';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name: string;
    role: string;
  };
  onLogout?: () => void;
}

export default function MobileNav({
  isOpen,
  onClose,
  user,
  onLogout,
}: MobileNavProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user: authUser, logout: authLogout } = useAuth();

  const currentUser = user || authUser || { name: 'Saurabh Thapliyal', role: 'Frontend Developer' };
  const handleLogout = onLogout || (() => authLogout());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.open : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <div
        className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className={styles.drawerHeader}>
          <div className={styles.brand}>
            <AxionixLogo size={16} />
            <span className={styles.brandName}>Axionix</span>
          </div>

          <div className={styles.headerRight}>
            <button
              type="button"
              onClick={toggleTheme}
              className={styles.iconBtn}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.iconBtn}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={styles.scrollArea}>
          {/* Main Navigation */}
          <nav className={styles.navGroup}>
            <Link
              href="/dashboard"
              onClick={onClose}
              className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}
            >
              <Activity size={15} />
              <span>Pulse</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={onClose}
              className={styles.navItem}
            >
              <Inbox size={15} />
              <span>Inbox</span>
              <span className={styles.badge}>3</span>
            </Link>

            <Link
              href="/projects/proj-1"
              onClick={onClose}
              className={`${styles.navItem} ${pathname.startsWith('/projects/') ? styles.active : ''}`}
            >
              <CheckCircle2 size={15} />
              <span>My issues</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={onClose}
              className={styles.navItem}
            >
              <GitPullRequest size={15} />
              <span>Reviews</span>
            </Link>
          </nav>

          <div className={styles.sectionDivider} />

          {/* Workspace */}
          <div className={styles.sectionHeader}>Workspace</div>
          <nav className={styles.navGroup}>
            <Link href="/dashboard" onClick={onClose} className={styles.navItem}>
              <Compass size={15} />
              <span>Initiatives</span>
            </Link>
            <Link
              href="/projects"
              onClick={onClose}
              className={`${styles.navItem} ${pathname === '/projects' ? styles.active : ''}`}
            >
              <FolderKanban size={15} />
              <span>Projects</span>
              <span className={styles.badge}>5</span>
            </Link>
          </nav>

          <div className={styles.sectionDivider} />

          {/* Favorites */}
          <div className={styles.sectionHeader}>Favorites</div>
          <nav className={styles.navGroup}>
            <Link
              href="/dashboard"
              onClick={onClose}
              className={styles.navItem}
            >
              <Circle size={8} fill="#f59e0b" strokeWidth={0} />
              <span>Faster app launch</span>
            </Link>

            <Link href="/dashboard" onClick={onClose} className={styles.navItem}>
              <Bot size={15} style={{ color: '#a855f7' }} />
              <span>Agent tasks</span>
            </Link>

            <Link href="/dashboard" onClick={onClose} className={styles.navItem}>
              <BarChart3 size={15} style={{ color: '#38bdf8' }} />
              <span>Agent Insights</span>
            </Link>

            <Link href="/dashboard" onClick={onClose} className={styles.navItem}>
              <Palette size={15} style={{ color: '#fb7185' }} />
              <span>UI Refresh</span>
            </Link>
          </nav>
        </div>

        <div className={styles.userFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{getInitials(currentUser.name)}</div>
            <div className={styles.userText}>
              <span className={styles.userName}>{currentUser.name}</span>
              <span className={styles.userRole}>{currentUser.role}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              handleLogout();
            }}
            className={styles.logoutButton}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
