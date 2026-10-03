'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown,
  Search,
  Plus,
  Activity,
  Inbox,
  CheckCircle2,
  GitPullRequest,
  Compass,
  FolderKanban,
  Bot,
  BarChart3,
  Palette,
  Settings,
  LogOut,
  HelpCircle,
  Check
} from 'lucide-react';
import AxionixLogo from '@/components/ui/Logo';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { openCreateTaskModal } from '@/components/features/tasks/CreateTaskModal/events';
import { getInitials } from '@/utils/format';
import { User } from '@/types';
import styles from './style.module.scss';

interface SidebarProps {
  user?: User;
  onLogout?: () => void;
  onOpenSearch?: () => void;
  onCreateIssue?: () => void;
}

export default function Sidebar({ 
  user, 
  onLogout,
  onOpenSearch,
  onCreateIssue
}: SidebarProps) {
  const pathname = usePathname();
  const { projects } = useTasks();
  const { user: authUser, logout: authLogout, switchUser, availableUsers } = useAuth();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const currentUser: User = user || authUser || { 
    id: 'user-1', 
    name: 'Saurabh Thapliyal', 
    email: 'sthap@axionix.dev', 
    role: 'Frontend Developer' 
  };
  const handleLogout = onLogout || (() => authLogout());

  return (
    <aside className={styles.sidebar} aria-label="Sidebar Navigation">
      {/* 1. Minimal Workspace Header */}
      <div className={styles.workspaceHeader}>
        <button 
          type="button" 
          className={styles.workspaceSelector}
          title="Switch workspace"
        >
          <AxionixLogo size={15} className={styles.brandIcon} />
          <span className={styles.workspaceName}>Axionix</span>
          <ChevronDown size={11} className={styles.chevron} strokeWidth={1.75} />
        </button>

        <div className={styles.headerActions}>
          <button 
            type="button" 
            onClick={onOpenSearch || (() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
            })}
            className={styles.actionBtn}
            title="Search (⌘K)"
            aria-label="Search"
          >
            <Search size={13} strokeWidth={1.5} />
          </button>
          <button 
            type="button" 
            onClick={onCreateIssue || (() => openCreateTaskModal())}
            className={styles.actionBtn}
            title="New Issue (C)"
            aria-label="New Issue"
          >
            <Plus size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* 2. Scrollable Minimal Navigation */}
      <div className={styles.navScrollArea}>
        {/* Core Nav */}
        <nav className={styles.navGroup} aria-label="Main Navigation">
          <Link
            href="/dashboard"
            className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}
          >
            <Activity size={14} strokeWidth={1.5} className={styles.itemIcon} />
            <span className={styles.itemLabel}>Pulse</span>
          </Link>

          <Link
            href="/dashboard"
            className={`${styles.navItem} ${styles.hasBadge}`}
          >
            <Inbox size={14} strokeWidth={1.5} className={styles.itemIcon} />
            <span className={styles.itemLabel}>Inbox</span>
            <span className={styles.countBadge}>3</span>
          </Link>

          <Link
            href="/projects/proj-1"
            className={`${styles.navItem} ${pathname.startsWith('/projects/') ? styles.active : ''}`}
          >
            <CheckCircle2 size={14} strokeWidth={1.5} className={styles.itemIcon} />
            <span className={styles.itemLabel}>My issues</span>
          </Link>

          <Link
            href="/dashboard"
            className={styles.navItem}
          >
            <GitPullRequest size={14} strokeWidth={1.5} className={styles.itemIcon} />
            <span className={styles.itemLabel}>Reviews</span>
          </Link>
        </nav>

        {/* Workspace Section */}
        <div className={styles.navSection}>
          <button 
            type="button" 
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className={styles.sectionHeader}
            aria-expanded={workspaceOpen}
          >
            <span>Workspace</span>
            <ChevronDown 
              size={11} 
              strokeWidth={1.75}
              className={`${styles.sectionChevron} ${workspaceOpen ? styles.rotated : ''}`} 
            />
          </button>

          {workspaceOpen && (
            <div className={styles.sectionItems}>
              <Link href="/dashboard" className={styles.navItem}>
                <Compass size={14} strokeWidth={1.5} className={styles.itemIcon} />
                <span className={styles.itemLabel}>Initiatives</span>
              </Link>

              <Link 
                href="/projects" 
                className={`${styles.navItem} ${pathname === '/projects' ? styles.active : ''}`}
              >
                <FolderKanban size={14} strokeWidth={1.5} className={styles.itemIcon} />
                <span className={styles.itemLabel}>Projects</span>
                <span className={styles.countBadge}>{projects.length}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Favorites Section */}
        <div className={styles.navSection}>
          <button 
            type="button" 
            onClick={() => setFavoritesOpen(!favoritesOpen)}
            className={styles.sectionHeader}
            aria-expanded={favoritesOpen}
          >
            <span>Favorites</span>
            <ChevronDown 
              size={11} 
              strokeWidth={1.75}
              className={`${styles.sectionChevron} ${favoritesOpen ? styles.rotated : ''}`} 
            />
          </button>

          {favoritesOpen && (
            <div className={styles.sectionItems}>
              <Link 
                href="/dashboard" 
                className={`${styles.navItem} ${styles.favoriteActive}`}
              >
                <span className={styles.statusDotAmber} />
                <span className={styles.itemLabel}>Faster app launch</span>
              </Link>

              <Link href="/dashboard" className={styles.navItem}>
                <Bot size={14} strokeWidth={1.5} className={styles.itemIcon} />
                <span className={styles.itemLabel}>Agent tasks</span>
              </Link>

              <Link href="/dashboard" className={styles.navItem}>
                <BarChart3 size={14} strokeWidth={1.5} className={styles.itemIcon} />
                <span className={styles.itemLabel}>Agent Insights</span>
              </Link>

              <Link href="/dashboard" className={styles.navItem}>
                <Palette size={14} strokeWidth={1.5} className={styles.itemIcon} />
                <span className={styles.itemLabel}>UI Refresh</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 3. Ultra-Clean Footer */}
      <div className={styles.sidebarFooter}>
        <div 
          className={styles.userProfile} 
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          title="Account options & profile switcher"
          role="button"
          tabIndex={0}
        >
          <div className={styles.avatar}>{getInitials(currentUser.name)}</div>
          <div className={styles.userMeta}>
            <span className={styles.userName}>{currentUser.name}</span>
          </div>
        </div>

        <div className={styles.footerActions}>
          <button 
            type="button" 
            className={styles.footerIconBtn} 
            title="Help"
            aria-label="Help"
          >
            <HelpCircle size={13} strokeWidth={1.5} />
          </button>
          
          <button 
            type="button" 
            className={styles.footerIconBtn} 
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={13} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className={styles.footerIconBtn}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={13} strokeWidth={1.5} />
          </button>
        </div>

        {/* Account popover & profile switcher */}
        {userMenuOpen && (
          <div className={styles.userMenuPopover}>
            <div className={styles.popoverHeader}>
              <span className={styles.popoverName}>{currentUser.name}</span>
              <span className={styles.popoverEmail}>{currentUser.email || 'sthap@axionix.dev'}</span>
              <span className={styles.popoverRole}>{currentUser.role || 'Member'}</span>
            </div>

            <div className={styles.popoverDivider} />

            <div className={styles.popoverSectionTitle}>Switch Profile</div>
            <div className={styles.switchList}>
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    switchUser(u.id);
                    setUserMenuOpen(false);
                  }}
                  className={`${styles.switchItem} ${currentUser.id === u.id ? styles.activeSwitchItem : ''}`}
                >
                  <span className={styles.switchAvatar}>{getInitials(u.name)}</span>
                  <div className={styles.switchInfo}>
                    <span className={styles.switchName}>{u.name}</span>
                    <span className={styles.switchRole}>{u.role}</span>
                  </div>
                  {currentUser.id === u.id && <Check size={12} className={styles.checkIcon} />}
                </button>
              ))}
            </div>

            <div className={styles.popoverDivider} />

            <button
              type="button"
              onClick={() => {
                setUserMenuOpen(false);
                handleLogout();
              }}
              className={styles.popoverSignOutBtn}
            >
              <LogOut size={12} />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
