'use client';

import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { INITIAL_USERS } from '@/services/mockData';
import { createPersistentStore } from '@/utils/persistentStore';
import { simulateErrorStore, usersStore, ApiError } from '@/context/TaskContext';
import { useToast } from '@/context/ToastContext';

const isUser = (value: unknown): value is User | null => {
  if (value === null) return true;
  if (typeof value !== 'object') return false;
  const u = value as Partial<User>;
  return typeof u.id === 'string' && typeof u.name === 'string' && typeof u.email === 'string';
};

export const authUserStore = createPersistentStore<User | null>(
  'axionix_auth_user',
  INITIAL_USERS[0],
  isUser
);

const AUTH_LATENCY_MS = 350;

export interface RegisterInput {
  name: string;
  email: string;
  role?: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  availableUsers: User[];
  login: (email: string, password?: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
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

  const availableUsers = useSyncExternalStore(
    usersStore.subscribe,
    usersStore.get,
    usersStore.getServer
  );

  const login = async (email: string, _password?: string): Promise<User> => {
    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, AUTH_LATENCY_MS));

    // Honor simulated failure mode
    if (simulateErrorStore.get()) {
      throw new ApiError('Authentication service unreachable (simulated error). Turn off Mock Error in the header to proceed.');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const currentUsers = usersStore.get();
    const matchedUser = currentUsers.find(
      (u) => u.email.toLowerCase() === trimmedEmail || u.name.toLowerCase().includes(trimmedEmail)
    );

    if (!matchedUser) {
      throw new ApiError('No account found with this email. Try "sthap@axionix.dev" or switch to "Create Account".');
    }

    authUserStore.set(matchedUser);
    return matchedUser;
  };

  const register = async (input: RegisterInput): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, AUTH_LATENCY_MS));

    if (simulateErrorStore.get()) {
      throw new ApiError('Registration failed (simulated error). Turn off Mock Error in the header to proceed.');
    }

    const trimmedEmail = input.email.trim().toLowerCase();
    const trimmedName = input.name.trim();

    if (!trimmedName) throw new ApiError('Please enter your full name.');
    if (!trimmedEmail) throw new ApiError('Please enter a valid email address.');

    const currentUsers = usersStore.get();
    if (currentUsers.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      throw new ApiError(`An account with email "${trimmedEmail}" already exists. Please sign in instead.`);
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      role: input.role?.trim() || 'Software Engineer',
    };

    // Save to persistent user store
    usersStore.set((prev) => [...prev, newUser]);
    // Set as active session
    authUserStore.set(newUser);

    return newUser;
  };

  const logout = async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    authUserStore.set(null);
    toast({
      variant: 'info',
      title: 'Signed out',
      description: 'You have been signed out of Axionix.',
    });
    router.push('/login');
  };

  const switchUser = async (userId: string): Promise<User> => {
    const currentUsers = usersStore.get();
    const target = currentUsers.find((u) => u.id === userId);
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
      availableUsers,
      login,
      register,
      logout,
      switchUser,
    }),
    [user, availableUsers]
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
