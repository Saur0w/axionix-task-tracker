'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  ChevronDown,
  Search,
  Plus,
  FolderKanban,
  Settings,
  LogOut,
  HelpCircle,
  Check,
  X,
  Share2,
  Sun,
  Moon,
  Flame
} from 'lucide-react';
import AxionixLogo from '@/components/ui/Logo';
import { useTasks, useSimulateError, simulateErrorStore } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { openCreateTaskModal } from '@/components/features/tasks/CreateTaskModal/events';
import { getInitials } from '@/utils/format';
import { User } from '@/types';
import { CORE_NAV_ITEMS, isNavItemActive } from '@/components/layout/navConfig';
import styles from './style.module.scss';

const PROJECT_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
];

interface SidebarProps {
  user?: User;
  onLogout?: () => void;
  onOpenSearch?: () => void;
  onCreateIssue?: () => void;
}

function SidebarContent({ 
  user, 
  onLogout,
  onOpenSearch,
  onCreateIssue
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { tasks, projects } = useTasks();
  const { user: authUser, logout: authLogout, switchUser, availableUsers } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const simulateError = useSimulateError();

  const [projectsOpen, setProjectsOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('Axionix Engineering');

  const sidebarRef = useRef<HTMLElement>(null);

  const currentUser: User = user || authUser || { 
    id: 'user-1', 
    name: 'Saurabh Thapliyal', 
    email: 'sthap@axionix.dev', 
    role: 'Frontend Developer' 
  };
  const handleLogout = onLogout || (() => authLogout());

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setWorkspaceMenuOpen(false);
        setSettingsMenuOpen(false);
        setHelpModalOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
        setWorkspaceMenuOpen(false);
        setSettingsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate live count of open issues assigned to current user
  const myIssuesCount = tasks.filter(
    (t) => t.assigneeId === currentUser.id && t.status !== 'DONE'
  ).length;

  const handleCopyInvite = () => {
    setWorkspaceMenuOpen(false);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
    }
    toast({
      variant: 'success',
      title: 'Invite link copied',
      description: 'Workspace invite link copied to clipboard.',
    });
  };

  const handleSwitchWorkspace = (name: string) => {
    setActiveWorkspace(name);
    setWorkspaceMenuOpen(false);
    toast({
      variant: 'info',
      title: 'Switched workspace',
      description: `Active workspace set to "${name}".`,
    });
  };

  const toggleSimulatedError = () => {
    const nextState = !simulateErrorStore.get();
    simulateErrorStore.set(nextState);
    toast({
      variant: nextState ? 'error' : 'success',
      title: nextState ? 'Mock Error Enabled' : 'Mock Error Disabled',
      description: nextState 
        ? 'All mutations will now fail with simulated network errors.' 
        : 'Mutations will now succeed normally.',
    });
  };

  return (
    <aside className={styles.sidebar} ref={sidebarRef} aria-label="Sidebar Navigation">
      {/* 1. Workspace Header */}
      <div className={styles.workspaceHeader}>
        <button 
          type="button" 
          onClick={() => {
            setWorkspaceMenuOpen(!workspaceMenuOpen);
            setUserMenuOpen(false);
            setSettingsMenuOpen(false);
          }}
          className={styles.workspaceSelector}
          title="Switch workspace options"
          aria-expanded={workspaceMenuOpen}
          aria-haspopup="true"
        >
          <AxionixLogo size={15} className={styles.brandIcon} />
          <span className={styles.workspaceName}>{activeWorkspace}</span>
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

        {/* Workspace Dropdown */}
        {workspaceMenuOpen && (
          <div className={styles.workspacePopover} role="menu">
            <div className={styles.popoverHeader}>
              <span className={styles.popoverName}>{activeWorkspace}</span>
              <span className={styles.popoverMeta}>Pro Workspace • {availableUsers.length} Team Members</span>
            </div>

            <div className={styles.popoverDivider} />

            <button
              type="button"
              onClick={() => handleSwitchWorkspace('Axionix Engineering')}
              className={`${styles.workspaceOption} ${activeWorkspace === 'Axionix Engineering' ? styles.activeWorkspace : ''}`}
            >
              <div className={styles.wsLeft}>
                <AxionixLogo size={13} />
                <span>Axionix Engineering</span>
              </div>
              {activeWorkspace === 'Axionix Engineering' && <Check size={12} className={styles.checkIcon} />}
            </button>

            <button
              type="button"
              onClick={() => handleSwitchWorkspace('Open Source Sandbox')}
              className={`${styles.workspaceOption} ${activeWorkspace === 'Open Source Sandbox' ? styles.activeWorkspace : ''}`}
            >
              <div className={styles.wsLeft}>
                <AxionixLogo size={13} />
                <span>Open Source Sandbox</span>
              </div>
              {activeWorkspace === 'Open Source Sandbox' && <Check size={12} className={styles.checkIcon} />}
            </button>

            <div className={styles.popoverDivider} />

            <button
              type="button"
              onClick={handleCopyInvite}
              className={styles.popoverActionBtn}
            >
              <Share2 size={12} />
              <span>Copy Invite Link</span>
            </button>

            <Link
              href="/projects"
              onClick={() => setWorkspaceMenuOpen(false)}
              className={styles.popoverActionBtn}
            >
              <FolderKanban size={12} />
              <span>All Projects Directory</span>
            </Link>
          </div>
        )}
      </div>

      {/* 2. Scrollable Navigation */}
      <div className={styles.navScrollArea}>
        {/* Core Primary Navigation */}
        <nav className={styles.navGroup} aria-label="Main Navigation">
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
                className={`${styles.navItem} ${active ? styles.active : ''}`}
              >
                <Icon size={14} strokeWidth={1.5} className={styles.itemIcon} />
                <span className={styles.itemLabel}>{item.label}</span>
                {badge !== undefined && (
                  <span className={styles.countBadge}>{badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Real Dynamic Projects Section */}
        <div className={styles.navSection}>
          <button 
            type="button" 
            onClick={() => setProjectsOpen(!projectsOpen)}
            className={styles.sectionHeader}
            aria-expanded={projectsOpen}
          >
            <span>Projects</span>
            <ChevronDown 
              size={11} 
              strokeWidth={1.75}
              className={`${styles.sectionChevron} ${projectsOpen ? styles.rotated : ''}`} 
            />
          </button>

          {projectsOpen && (
            <div className={styles.sectionItems}>
              {projects.map((project, index) => {
                const projectHref = `/projects/${project.id}`;
                const isActive = pathname === projectHref;
                const dotColor = PROJECT_COLORS[index % PROJECT_COLORS.length];

                return (
                  <Link
                    key={project.id}
                    href={projectHref}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    title={project.name}
                  >
                    <span 
                      className={styles.projectColorDot} 
                      style={{ backgroundColor: dotColor }} 
                    />
                    <span className={styles.itemLabel}>{project.name}</span>
                  </Link>
                );
              })}

              <Link href="/projects" className={styles.newProjectLink}>
                <Plus size={12} strokeWidth={2} />
                <span>New Project</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 3. Footer */}
      <div className={styles.sidebarFooter}>
        <button 
          type="button"
          className={styles.userProfile} 
          onClick={() => {
            setUserMenuOpen(!userMenuOpen);
            setWorkspaceMenuOpen(false);
            setSettingsMenuOpen(false);
          }}
          title="Account profile switcher"
          aria-haspopup="dialog"
          aria-expanded={userMenuOpen}
        >
          <div className={styles.avatar}>{getInitials(currentUser.name)}</div>
          <div className={styles.userMeta}>
            <span className={styles.userName}>{currentUser.name}</span>
          </div>
        </button>

        <div className={styles.footerActions}>
          <button 
            type="button" 
            onClick={() => setHelpModalOpen(true)}
            className={styles.footerIconBtn} 
            title="Keyboard Shortcuts & Help"
            aria-label="Help"
          >
            <HelpCircle size={13} strokeWidth={1.5} />
          </button>
          
          <button 
            type="button" 
            onClick={() => {
              setSettingsMenuOpen(!settingsMenuOpen);
              setUserMenuOpen(false);
              setWorkspaceMenuOpen(false);
            }}
            className={styles.footerIconBtn} 
            title="Quick Settings"
            aria-label="Settings"
            aria-expanded={settingsMenuOpen}
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

        {/* Quick Settings Popover */}
        {settingsMenuOpen && (
          <div className={styles.settingsPopover} role="dialog" aria-label="Settings">
            <div className={styles.popoverHeader}>
              <span className={styles.popoverName}>Preferences</span>
              <span className={styles.popoverMeta}>Axionix Task Tracker v0.1.0</span>
            </div>

            <div className={styles.popoverDivider} />

            <button
              type="button"
              onClick={toggleTheme}
              className={styles.settingRow}
            >
              <span className={styles.settingLabel}>
                {theme === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
                <span>Theme</span>
              </span>
              <span className={styles.settingValue}>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>

            <button
              type="button"
              onClick={toggleSimulatedError}
              className={styles.settingRow}
              title="When enabled, mutations throw simulated network errors"
            >
              <span className={styles.settingLabel}>
                <Flame size={13} style={{ color: simulateError ? 'var(--danger)' : 'var(--text-muted)' }} />
                <span>Simulate Error</span>
              </span>
              <span className={styles.settingValue} style={{ color: simulateError ? 'var(--danger)' : undefined }}>
                {simulateError ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        )}

        {/* Account popover & profile switcher */}
        {userMenuOpen && (
          <div className={styles.userMenuPopover} role="dialog" aria-label="User Profiles">
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

      {/* 4. Keyboard Shortcuts & Help Modal */}
      {helpModalOpen && (
        <div 
          className={styles.helpModalBackdrop} 
          onClick={() => setHelpModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className={styles.helpModal} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.helpHeader}>
              <h3>Keyboard Shortcuts & Tips</h3>
              <button 
                type="button" 
                onClick={() => setHelpModalOpen(false)}
                className={styles.closeBtn}
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>
            </div>

            <div className={styles.shortcutList}>
              <div className={styles.shortcutRow}>
                <span>Create new issue</span>
                <kbd>C</kbd>
              </div>
              <div className={styles.shortcutRow}>
                <span>Search issues & projects</span>
                <kbd>⌘K / Ctrl+K</kbd>
              </div>
              <div className={styles.shortcutRow}>
                <span>Close dialogs / menus</span>
                <kbd>Esc</kbd>
              </div>
              <div className={styles.shortcutRow}>
                <span>Toggle error simulation</span>
                <span>Header / Settings</span>
              </div>
            </div>

            <div className={styles.helpFooter}>
              <span>Axionix Task Tracker • Linear Aesthetic</span>
              <button type="button" onClick={() => setHelpModalOpen(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={<aside className={styles.sidebar} aria-label="Sidebar Navigation" />}>
      <SidebarContent {...props} />
    </Suspense>
  );
}
