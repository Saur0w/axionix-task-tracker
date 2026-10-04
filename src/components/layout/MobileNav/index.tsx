'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  X, 
  LogOut,
  Sun,
  Moon,
  Plus
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TaskContext';
import { getInitials } from '@/utils/format';
import { User } from '@/types';
import AxionixLogo from '@/components/ui/Logo';
import { CORE_NAV_ITEMS, isNavItemActive } from '@/components/layout/navConfig';
import styles from './style.module.scss';

const PROJECT_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#8b5cf6',
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onLogout?: () => void;
}

function MobileNavContent({
  isOpen,
  onClose,
  user,
  onLogout,
}: MobileNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const { user: authUser, logout: authLogout } = useAuth();
  const { tasks, projects } = useTasks();

  const currentUser = user || authUser || { 
    id: 'user-1',
    name: 'Saurabh Thapliyal', 
    email: 'sthap@axionix.dev',
    role: 'Frontend Developer' 
  };
  const handleLogout = onLogout || (() => authLogout());

  const myIssuesCount = tasks.filter(
    (t) => t.assigneeId === currentUser.id && t.status !== 'DONE'
  ).length;

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
          <nav className={styles.navGroup}>
            {CORE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isNavItemActive(pathname, searchParams, item.href);
              const badge = item.id === 'my-issues'
                ? (myIssuesCount > 0 ? myIssuesCount : undefined)
                : item.id === 'projects'
                ? projects.length
                : undefined;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={`${styles.navItem} ${active ? styles.active : ''}`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                  {badge !== undefined && (
                    <span className={styles.badge}>{badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className={styles.sectionDivider} />

          <div className={styles.sectionHeader}>Projects</div>
          <nav className={styles.navGroup}>
            {projects.map((project, index) => {
              const projectHref = `/projects/${project.id}`;
              const isActive = pathname === projectHref;
              const dotColor = PROJECT_COLORS[index % PROJECT_COLORS.length];

              return (
                <Link
                  key={project.id}
                  href={projectHref}
                  onClick={onClose}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <span 
                    style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: dotColor,
                      flexShrink: 0
                    }} 
                  />
                  <span>{project.name}</span>
                </Link>
              );
            })}

            <Link
              href="/projects"
              onClick={onClose}
              className={styles.navItem}
              style={{ color: 'var(--text-muted)' }}
            >
              <Plus size={14} />
              <span>New Project</span>
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

export default function MobileNav(props: MobileNavProps) {
  return (
    <Suspense fallback={null}>
      <MobileNavContent {...props} />
    </Suspense>
  );
}
