"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Project, User, TaskStatus, TaskPriority } from '@/types';
import { INITIAL_USERS, INITIAL_PROJECTS, INITIAL_TASKS } from '@/services/mockData';

interface CreateTaskInput {
    projectId: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    assigneeId?: string;
    dueDate?: string;
}

interface TaskContextType {
    tasks: Task[];
    projects: Project[];
    users: User[];
    createTask: (input: CreateTaskInput) => Promise<Task>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task>;
    deleteTask: (taskId: string) => Promise<void>;
    updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
    getTasksByProject: (projectId: string) => Task[];
    getProjectById: (projectId: string) => Project | undefined;
    getUserById: (userId: string) => User | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEYS = {
    TASKS: 'axionix_tasks',
    PROJECTS: 'axionix_projects',
};

export function TaskProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
            if (saved) {
                try { return JSON.parse(saved); } catch (e) { /* ignore */ }
            }
        }
        return INITIAL_TASKS;
    });

    const [projects, setProjects] = useState<Project[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
            if (saved) {
                try { return JSON.parse(saved); } catch (e) { /* ignore */ }
            }
        }
        return INITIAL_PROJECTS;
    });

    const [users] = useState<User[]>(INITIAL_USERS);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    }, [projects]);

    const checkSimulatedError = () => {
        if (typeof window !== 'undefined' && localStorage.getItem('axionix_simulate_error') === 'true') {
            throw new Error('Simulated Network Error: Failed to perform database operation!');
        }
    };

    const createTask = async (input: CreateTaskInput): Promise<Task> => {
        checkSimulatedError();

        const newTask: Task = {
            id: `task-${Date.now()}`,
            projectId: input.projectId,
            title: input.title,
            description: input.description || '',
            status: input.status || 'TODO',
            priority: input.priority || 'MEDIUM',
            assigneeId: input.assigneeId || 'user-1',
            dueDate: input.dueDate || new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setTasks((prev) => [newTask, ...prev]);
        return newTask;
    };

    const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
        checkSimulatedError();

        let updated: Task | undefined;
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id === taskId) {
                    updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
                    return updated;
                }
                return t;
            })
        );

        if (!updated) throw new Error(`Task ${taskId} not found`);
        return updated;
    };

    const updateTaskStatus = async (taskId: string, newStatus: TaskStatus): Promise<void> => {
        await updateTask(taskId, { status: newStatus });
    };

    const deleteTask = async (taskId: string): Promise<void> => {
        checkSimulatedError();
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
    };

    const getTasksByProject = (projectId: string) => {
        return tasks.filter((t) => t.projectId === projectId);
    };

    const getProjectById = (projectId: string) => {
        return projects.find((p) => p.id === projectId);
    };

    const getUserById = (userId: string) => {
        return users.find((u) => u.id === userId);
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                projects,
                users,
                createTask,
                updateTask,
                deleteTask,
                updateTaskStatus,
                getTasksByProject,
                getProjectById,
                getUserById,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
