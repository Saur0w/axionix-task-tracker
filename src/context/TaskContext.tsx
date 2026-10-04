'use client';

import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { Task, Project, User, TaskStatus, TaskPriority } from '@/types';
import { INITIAL_USERS, INITIAL_PROJECTS, INITIAL_TASKS } from '@/services/mockData';
import { createPersistentStore } from '@/utils/persistentStore';

/* -------------------------------------------------------------------------- */
/*  Mock "database": localStorage-backed stores                               */
/* -------------------------------------------------------------------------- */

const isArray = <T,>(value: unknown): value is T[] => Array.isArray(value);

export const tasksStore = createPersistentStore<Task[]>('axionix_tasks', INITIAL_TASKS, isArray);
export const projectsStore = createPersistentStore<Project[]>('axionix_projects', INITIAL_PROJECTS, isArray);
export const usersStore = createPersistentStore<User[]>('axionix_users', INITIAL_USERS, isArray);

/** Assignment Req #3: when true, every mutation fails like a real network error. */
export const simulateErrorStore = createPersistentStore<boolean>(
  'axionix_simulate_error',
  false,
  (v): v is boolean => typeof v === 'boolean'
);

/** Thrown by the mock API so the UI can tell expected failures apart from bugs. */
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const LATENCY_MS = 300;

async function simulateRequest(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  if (simulateErrorStore.get()) {
    throw new ApiError('Network request failed (simulated). Turn off Mock Error and try again.');
  }
}

function nextTaskId(tasks: Task[]): string {
  const max = tasks.reduce((highest, task) => {
    const match = /^task-(\d{1,5})$/.exec(task.id);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `task-${max + 1}`;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string;
  dueDate?: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  memberIds?: string[];
}

async function createTask(input: CreateTaskInput): Promise<Task> {
  await simulateRequest();

  const now = new Date().toISOString();
  const newTask: Task = {
    id: nextTaskId(tasksStore.get()),
    projectId: input.projectId,
    title: input.title,
    description: input.description ?? '',
    status: input.status ?? 'TODO',
    priority: input.priority ?? 'MEDIUM',
    assigneeId: input.assigneeId ?? 'user-1',
    dueDate: input.dueDate || now.split('T')[0],
    createdAt: now,
    updatedAt: now,
  };

  tasksStore.set((prev) => [newTask, ...prev]);
  return newTask;
}

async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const original = tasksStore.get().find((t) => t.id === taskId);
  if (!original) throw new ApiError(`Task ${taskId} not found`);

  const updated: Task = { ...original, ...updates, id: original.id, updatedAt: new Date().toISOString() };
  tasksStore.set((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

  try {
    await simulateRequest();
    return updated;
  } catch (error) {
    tasksStore.set((prev) => prev.map((t) => (t.id === taskId ? original : t)));
    throw error;
  }
}

async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  await updateTask(taskId, { status });
}

async function deleteTask(taskId: string): Promise<void> {
  const snapshot = tasksStore.get();
  const index = snapshot.findIndex((t) => t.id === taskId);
  if (index === -1) throw new ApiError(`Task ${taskId} not found`);
  const removed = snapshot[index];

  tasksStore.set((prev) => prev.filter((t) => t.id !== taskId));

  try {
    await simulateRequest();
  } catch (error) {
    tasksStore.set((prev) => {
      const next = [...prev];
      next.splice(Math.min(index, next.length), 0, removed);
      return next;
    });
    throw error;
  }
}

async function createProject(input: CreateProjectInput): Promise<Project> {
  await simulateRequest();

  const newProject: Project = {
    id: `proj-${Date.now()}`,
    name: input.name,
    description: input.description,
    memberIds: input.memberIds ?? ['user-1'],
    createdAt: new Date().toISOString(),
  };

  projectsStore.set((prev) => [newProject, ...prev]);
  return newProject;
}

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  users: User[];
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  getTasksByProject: (projectId: string) => Task[];
  getProjectById: (projectId: string) => Project | undefined;
  getUserById: (userId: string) => User | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const tasks = useSyncExternalStore(tasksStore.subscribe, tasksStore.get, tasksStore.getServer);
  const projects = useSyncExternalStore(projectsStore.subscribe, projectsStore.get, projectsStore.getServer);
  const users = useSyncExternalStore(usersStore.subscribe, usersStore.get, usersStore.getServer);

  const value = useMemo<TaskContextType>(
    () => ({
      tasks,
      projects,
      users,
      createTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      createProject,
      getTasksByProject: (projectId) => tasks.filter((t) => t.projectId === projectId),
      getProjectById: (projectId) => projects.find((p) => p.id === projectId),
      getUserById: (userId) => users.find((u) => u.id === userId),
    }),
    [tasks, projects, users]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}

export function useSimulateError() {
  return useSyncExternalStore(simulateErrorStore.subscribe, simulateErrorStore.get, simulateErrorStore.getServer);
}
