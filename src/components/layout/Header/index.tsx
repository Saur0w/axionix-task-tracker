'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Plus, 
  Menu, 
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import styles from './style.module.scss';

interface HeaderProps {
  onOpenMobileNav?: () => void;
  onCreateClick?: () => void;
  onSearchChange?: (query: string) => void;
}

export default function Header({ 
  onOpenMobileNav, 
  onCreateClick,
  onSearchChange 
}: HeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  
  const [simulateError, setSimulateError] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('axionix_simulate_error') === 'true';
    }
    return false;
  });

  // Sync simulated error state across tabs / components (Assignment Req #3)
  useEffect(() => {
    const handleStorageChange = () => {
      setSimulateError(localStorage.getItem('axionix_simulate_error') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('axionix_error_toggle', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('axionix_error_toggle', handleStorageChange);
    };
  }, []);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchActive(true);
      }
      if (e.key === 'Escape' && isSearchActive) {
        setIsSearchActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchActive]);

  const toggleSimulateError = () => {
    const nextState = !simulateError;
    setSimulateError(nextState);
    localStorage.setItem('axionix_simulate_error', nextState ? 'true' : 'false');
    window.dispatchEvent(new Event('axionix_error_toggle'));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
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

      {/* Right: Search Pill, Mock Error Toggle, Theme, Notifications & New Issue */}
      <div className={styles.rightSection}>
        {isSearchActive ? (
          <div className={styles.searchActiveWrapper}>
            <Search size={13} strokeWidth={1.5} className={styles.searchIcon} />
            <input
              type="text"
              autoFocus
              value={searchVal}
              onChange={handleSearch}
              onBlur={() => !searchVal && setIsSearchActive(false)}
              placeholder="Search or jump to..."
              className={styles.searchInput}
            />
            <kbd className={styles.escBadge} onClick={() => setIsSearchActive(false)}>ESC</kbd>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsSearchActive(true)}
            className={styles.searchPillBtn}
            title="Search or jump to... (⌘K)"
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
          title="Toggle simulated error (Req #3)"
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
          onClick={onCreateClick || (() => window.dispatchEvent(new CustomEvent('axionix_create_issue')))}
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
