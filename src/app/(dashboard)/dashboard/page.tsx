'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    CheckCircle2,
    Circle,
    Clock,
    Plus,
    FolderKanban,
    X,
    Flame,
    ArrowUpRight,
    Sparkles
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { TaskStatus, TaskPriority } from '@/types';
import styles from './style.module.scss';

export default function DashboardPage() {
    const { tasks, projects, updateTaskStatus, createTask } = useTasks();
    const [activeFilter, setActiveFilter] = useState<'ALL' | TaskStatus>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newProjectId, setNewProjectId] = useState(projects[0]?.id || 'proj-1');
    const [newPriority, setNewPriority] = useState<TaskPriority>('MEDIUM');
    const [shouldCrash, setShouldCrash] = useState(false);

    if (shouldCrash) {
        throw new Error('Simulated Crash: Failed to load dashboard telemetry!');
    }

    const stats = useMemo(() => {
        const total = tasks.length;
        const done = tasks.filter((t) => t.status === 'DONE').length;
        const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
        const todo = tasks.filter((t) => t.status === 'TODO').length;
        const rate = total > 0 ? Math.round((done / total) * 100) : 0;
        return { total, done, inProgress, todo, rate };
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        if (activeFilter === 'ALL') return tasks;
        return tasks.filter((t) => t.status === activeFilter);
    }, [tasks, activeFilter]);

    const handleToggleStatus = (taskId: string, currentStatus: TaskStatus) => {
        const nextStatus: Record<TaskStatus, TaskStatus> = {
            TODO: 'IN_PROGRESS',
            IN_PROGRESS: 'DONE',
            DONE: 'TODO',
        };
        updateTaskStatus(taskId, nextStatus[currentStatus]);
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        await createTask({
            title: newTitle.trim(),
            projectId: newProjectId,
            priority: newPriority,
            status: 'TODO',
        });

        setNewTitle('');
        setIsModalOpen(false);
    };

    return (
        <div className={styles.dashboard}>
            <section className={styles.heroRow}>
                <div className={styles.heroText}>
                    <div className={styles.pulseTag}>
                        <span className={styles.pulseDot} />
                        <span>Active Sprint Cycle</span>
                    </div>
                    <h1 className={styles.heading}>Engineering Overview</h1>
                    <p className={styles.subheading}>
                        Real-time project telemetry, assigned issues, and delivery status.
                    </p>
                </div>

                <div className={styles.heroActions}>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className={styles.primaryBtn}
                    >
                        <Plus size={15} />
                        <span>Create Issue</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShouldCrash(true)}
                        className={styles.crashBtn}
                        title="Trigger test crash for error boundary"
                    >
                        <Flame size={14} />
                        <span>Simulate Crash</span>
                    </button>
                </div>
            </section>

            <section className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Total Issues</span>
                    <span className={styles.metricValue}>{stats.total}</span>
                    <span className={styles.metricHint}>Active in workspace</span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>In Progress</span>
                    <span className={`${styles.metricValue} ${styles.amber}`}>{stats.inProgress}</span>
                    <span className={styles.metricHint}>Under active review</span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Completed</span>
                    <span className={`${styles.metricValue} ${styles.green}`}>{stats.done}</span>
                    <span className={styles.metricHint}>Shipped this cycle</span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Completion Rate</span>
                    <span className={styles.metricValue}>{stats.rate}%</span>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${stats.rate}%` }} />
                    </div>
                </div>
            </section>

            <section className={styles.tasksSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.filterTabs}>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('ALL')}
                            className={`${styles.tab} ${activeFilter === 'ALL' ? styles.activeTab : ''}`}
                        >
                            All Issues <span className={styles.badge}>{stats.total}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('IN_PROGRESS')}
                            className={`${styles.tab} ${activeFilter === 'IN_PROGRESS' ? styles.activeTab : ''}`}
                        >
                            In Progress <span className={styles.badge}>{stats.inProgress}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('TODO')}
                            className={`${styles.tab} ${activeFilter === 'TODO' ? styles.activeTab : ''}`}
                        >
                            To Do <span className={styles.badge}>{stats.todo}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('DONE')}
                            className={`${styles.tab} ${activeFilter === 'DONE' ? styles.activeTab : ''}`}
                        >
                            Done <span className={styles.badge}>{stats.done}</span>
                        </button>
                    </div>

                    <Link href="/projects" className={styles.viewProjectsLink}>
                        <FolderKanban size={13} />
                        <span>Manage Projects</span>
                        <ArrowUpRight size={13} />
                    </Link>
                </div>

                <div className={styles.taskList}>
                    {filteredTasks.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Sparkles size={24} className={styles.emptyIcon} />
                            <p>No issues found in this category.</p>
                        </div>
                    ) : (
                        filteredTasks.map((task) => {
                            const project = projects.find((p) => p.id === task.projectId);

                            return (
                                <div key={task.id} className={styles.taskRow}>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleStatus(task.id, task.status)}
                                        className={`${styles.statusToggle} ${styles[task.status.toLowerCase()]}`}
                                        title={`Status: ${task.status} (Click to toggle)`}
                                    >
                                        {task.status === 'DONE' && <CheckCircle2 size={15} />}
                                        {task.status === 'IN_PROGRESS' && <Clock size={15} />}
                                        {task.status === 'TODO' && <Circle size={15} />}
                                    </button>

                                    <span className={`${styles.priorityTag} ${styles[task.priority.toLowerCase()]}`}>
                                        {task.priority}
                                    </span>

                                    <span className={styles.taskKey}>
                                        {task.id.replace('task-', 'AX-')}
                                    </span>

                                    <div className={styles.taskInfo}>
                                        <span className={`${styles.taskTitle} ${task.status === 'DONE' ? styles.strike : ''}`}>
                                            {task.title}
                                        </span>
                                        {task.description && (
                                            <span className={styles.taskDesc}>{task.description}</span>
                                        )}
                                    </div>

                                    <span className={styles.projectBadge}>
                                        {project ? project.name : 'Platform'}
                                    </span>

                                    <span className={styles.dueDate}>
                                        {task.dueDate || 'Today'}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Create New Issue</h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className={styles.closeBtn}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Issue Title</label>
                                <input
                                    type="text"
                                    autoFocus
                                    required
                                    placeholder="e.g. Implement OAuth2 refresh token rotation"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Project</label>
                                    <select
                                        value={newProjectId}
                                        onChange={(e) => setNewProjectId(e.target.value)}
                                        className={styles.select}
                                    >
                                        {projects.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Priority</label>
                                    <select
                                        value={newPriority}
                                        onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                                        className={styles.select}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className={styles.cancelBtn}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    Create Issue
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
