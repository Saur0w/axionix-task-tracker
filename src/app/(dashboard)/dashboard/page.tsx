'use client';

import React from 'react';
import styles from './style.module.scss';

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Team Dashboard</h2>
        <p className={styles.subtitle}>Overview of projects, deliverables, and upcoming tasks.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Tasks</span>
          <span className={styles.statValue}>15</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>In Progress</span>
          <span className={styles.statValue}>6</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completed</span>
          <span className={styles.statValue}>5</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Overdue</span>
          <span className={styles.statValue} style={{ color: 'var(--danger)' }}>2</span>
        </div>
      </div>
    </div>
  );
}
