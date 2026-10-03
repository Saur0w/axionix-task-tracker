'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Plus, 
  Menu, 
  AlertTriangle,
  X
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useSearch } from '@/context/SearchContext';
import { useToast } from '@/context/ToastContext';
import { simulateErrorStore, useSimulateError } from '@/context/TaskContext';
import { openCreateTaskModal } from '@/components/features/tasks/CreateTaskModal/events';
import styles from './style.module.scss';

interface HeaderProps {
  onOpenMobileNav?: () => void;
  onCreateClick?: () => void;
}

export default function Header({ 
  onOpenMobileNav, 
  onCreateClick,
}: HeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { query, setQuery } = useSearch();
  const { toast } = useToast();
  const simulateError = useSimulateError();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showSearchInput = isSearchActive || query.length > 0;

  // Cmd/Ctrl + K opens and focuses the search field from anywhere.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchActive(true);
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setIsSearchActive(false);
  };

  // Assignment Req #3: flip the mock API into failure mode.
  const toggleSimulateError = () => {
    const next = !simulateErrorStore.get();
    simulateErrorStore.set(next);
    toast(
      next
        ? { variant: 'error', title: 'Mock Error enabled', description: 'Creating or updating issues will now fail.' }
        : { variant: 'success', title: 'Mock Error disabled', description: 'Requests are back to normal.' }
    );
  };

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Overview';
    if (pathname === '/projects') return 'Projects';
    if (pathname.startsWith('/projects/')) return 'Task Board';
    return 'Dashboard';
  };

  return (
    <header className={styles.header}>
      {/* Left: Mobile Navigation Trigger & Dynamic Page Breadcrumb */}
      <div className={styles.leftSection}>
        <button
          type="button"
          onClick={onOpenMobileNav}
          className={styles.mobileToggle}
          aria-label="Open navigation menu"
        >
          <Menu size={16} strokeWidth={1.5} />
        </button>

        <div className={styles.breadcrumbs}>
          <span className={styles.workspaceLabel}>Axionix</span>
          <span className={styles.separator}>/</span>
          <span className={styles.pageTitle}>{getPageTitle()}</span>
        </div>
      </div>

      {/* Right: Search, Mock Error Toggle, Theme, Notifications & New Issue */}
      <div className={styles.rightSection}>
        {showSearchInput ? (
          <div className={styles.searchActiveWrapper} role="search">
            <Search size={13} strokeWidth={1.5} className={styles.searchIcon} />
            <input
              ref={searchInputRef}
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => !query && setIsSearchActive(false)}
              onKeyDown={(e) => e.key === 'Escape' && clearSearch()}
              placeholder="Filter issues…"
              aria-label="Filter issues"
              className={styles.searchInput}
            />
            {query ? (
              <button type="button" className={styles.clearBtn} onClick={clearSearch} aria-label="Clear search">
                <X size={12} strokeWidth={1.75} />
              </button>
            ) : (
              <kbd className={styles.escBadge}>ESC</kbd>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsSearchActive(true)}
            className={styles.searchPillBtn}
            title="Search (Ctrl+K)"
          >
            <Search size={13} strokeWidth={1.5} />
            <span>Search...</span>
            <kbd className={styles.shortcutKey}>⌘K</kbd>
          </button>
        )}

        <div className={styles.divider} />

        {/* Assignment Req #3: Simulated Network Error Toggle */}
        <button
          type="button"
          onClick={toggleSimulateError}
          className={`${styles.errorToggle} ${simulateError ? styles.errorActive : ''}`}
          title="Make the mock API fail every request (Req #3)"
          aria-pressed={simulateError}
        >
          <AlertTriangle size={12} strokeWidth={1.5} />
          <span>{simulateError ? 'Error: ON' : 'Mock Error'}</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className={styles.iconBtn}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={14} strokeWidth={1.5} />
          <span className={styles.bellDot} />
        </button>

        {/* Dark / Light Mode Switch */}
        <button
          type="button"
          onClick={toggleTheme}
          className={styles.iconBtn}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
        </button>

        {/* New Issue Button */}
        <button
          type="button"
          onClick={onCreateClick || (() => openCreateTaskModal())}
          className={styles.newIssueBtn}
          title="New Issue (C)"
          aria-label="New Issue"
        >
          <Plus size={13} strokeWidth={2} />
          <span>New Issue</span>
          <kbd className={styles.btnShortcut}>C</kbd>
        </button>
      </div>
    </header>
  );
}
