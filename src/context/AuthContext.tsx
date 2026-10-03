'use client';

import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { INITIAL_USERS } from '@/services/mockData';
import { createPersistentStore } from '@/utils/persistentStore';
import { simulateErrorStore, ApiError } from '@/context/TaskContext';
import { useToast } from '@/context/ToastContext';

/* -------------------------------------------------------------------------- */
/*  Persistent Auth Store (Hydration-Safe via useSyncExternalStore)           */
/* -------------------------------------------------------------------------- */

const isUser = (value: unknown): value is User | null => {
  if (value === null) return true;
  if (typeof value !== 'object' || value === null) return false;
  const u = value as Partial<User>;
  return typeof u.id === 'string' && typeof u.name === 'string' && typeof u.email === 'string';
};

/** Default to the first team user (Saurabh Thapliyal) for an immediate seamless experience. */
export const authUserStore = createPersistentStore<User | null>(
  'axionix_auth_user',
  INITIAL_USERS[0],
  isUser
);

const AUTH_LATENCY_MS = 400;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  availableUsers: User[];
  login: (email: string, password?: string) => Promise<User>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();

  const user = useSyncExternalStore(
    authUserStore.subscribe,
    authUserStore.get,
    authUserStore.getServer
  );

  const login = async (email: string, _password?: string): Promise<User> => {
    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, AUTH_LATENCY_MS));

    // Assignment Req #3: Honor simulated failure mode
    if (simulateErrorStore.get()) {
      throw new ApiError('Authentication service unreachable (simulated error). Turn off Mock Error in the header to proceed.');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const matchedUser = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === trimmedEmail || u.name.toLowerCase().includes(trimmedEmail)
    );

    if (!matchedUser) {
      throw new ApiError('No account found with this email. Try "sthap@axionix.dev" or choose a demo profile.');
    }

    authUserStore.set(matchedUser);
    return matchedUser;
  };

  const logout = async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    authUserStore.set(null);
    toast({
      variant: 'info',
      title: 'Signed out',
      description: 'You have been signed out of Axionix.',
    });
    router.push('/login');
  };

  const switchUser = async (userId: string): Promise<User> => {
    const target = INITIAL_USERS.find((u) => u.id === userId);
    if (!target) {
      throw new ApiError('Selected user profile was not found.');
    }
    authUserStore.set(target);
    toast({
      variant: 'success',
      title: 'Profile switched',
      description: `Active as ${target.name} (${target.role || 'Member'}).`,
    });
    return target;
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: user !== null,
      availableUsers: INITIAL_USERS,
      login,
      logout,
      switchUser,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
