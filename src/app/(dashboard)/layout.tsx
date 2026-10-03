'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import CreateTaskModal from '@/components/features/tasks/CreateTaskModal';
import { SearchProvider } from '@/context/SearchContext';
import { useAuth } from '@/context/AuthContext';
import styles from './layout.module.scss';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  if (user === null) {
    return null;
  }

  return (
    <SearchProvider>
      <div className={styles.layoutContainer}>
        <Sidebar />

        <div className={styles.contentArea}>
          <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className={styles.main}>
            {children}
          </main>
        </div>

        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        {/* One create-issue modal for every page (header, sidebar and `C` all open it). */}
        <CreateTaskModal />
      </div>
    </SearchProvider>
  );
}
