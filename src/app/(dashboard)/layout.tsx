'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import styles from './layout.module.scss';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={styles.layoutContainer}>
      {/* Desktop Sticky Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className={styles.main}>
          {children}
        </main>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </div>
  );
}
