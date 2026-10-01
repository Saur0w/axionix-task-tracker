'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Settings, 
  X, 
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
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
  user = { name: 'Saurabh Thapliyal', role: 'Frontend Developer Intern' },
  onLogout,
}: MobileNavProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

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
            <div className={styles.brandLogo}>
              <span className={styles.logoBarPrimary} />
              <span className={styles.logoBarSecondary} />
            </div>
            <span className={styles.brandName}>Axionix</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={toggleTheme}
              className={styles.closeButton}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className={styles.navSection}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className={`${styles.navItem} ${link.isActive ? styles.active : ''}`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.userFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>ST</div>
            <div className={styles.userText}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>{user.role}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            className={styles.logoutButton}
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
