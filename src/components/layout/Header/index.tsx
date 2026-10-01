'use client';

import React, { useState, useEffect } from 'react';
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
  const { theme, toggleTheme } = useTheme();
  const [searchVal, setSearchVal] = useState('');
  const [simulateError, setSimulateError] = useState(false);

  // Sync simulated error state with localStorage
  useEffect(() => {
    const saved = localStorage.getItem('axionix_simulate_error') === 'true';
    setSimulateError(saved);

    const handleStorageChange = () => {
      setSimulateError(localStorage.getItem('axionix_simulate_error') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  return (
    <header className={styles.header}>
      {/* Left: Mobile Toggle & Search Bar */}
      <div className={styles.leftSection}>
        <button
          type="button"
          onClick={onOpenMobileNav}
          className={styles.mobileToggle}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearch}
            placeholder="Search projects, tasks, or people..."
            className={styles.searchInput}
            aria-label="Search"
          />
        </div>
      </div>

      {/* Right: Notifications, Theme Switcher, Simulated Error, + Create */}
      <div className={styles.rightSection}>
        {/* Requirement 3: Simulated API Error Toggle */}
        <button
          type="button"
          onClick={toggleSimulateError}
          className={`${styles.errorToggle} ${simulateError ? styles.errorActive : ''}`}
          title="Toggle simulated network failure (Assignment Req #3)"
          aria-pressed={simulateError}
        >
          <AlertTriangle size={13} />
          <span>{simulateError ? 'Simulate Error: ON' : 'Mock Error'}</span>
        </button>

        {/* Notifications with Unread Dot */}
        <button
          type="button"
          className={styles.iconButton}
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell size={18} />
          <span className={styles.badgeDot} />
        </button>

        {/* Dark / Light Mode Switch */}
        <button
          type="button"
          onClick={toggleTheme}
          className={styles.iconButton}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Minimal High-Contrast + Create Button */}
        <button
          type="button"
          onClick={onCreateClick || (() => alert('Create modal will open here'))}
          className={styles.createButton}
          aria-label="Create new item"
        >
          <Plus size={16} />
          <span>Create</span>
        </button>
      </div>
    </header>
  );
}
