'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
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

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const metricsRef = useRef<HTMLElement>(null);
  const tasksSectionRef = useRef<HTMLElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const modalOverlayRef = useRef<HTMLDivElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenCreate = () => setIsModalOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (e.key.toLowerCase() === 'c' && !isModalOpen && activeTag !== 'input' && activeTag !== 'textarea') {
        setIsModalOpen(true);
      }
    };

    window.addEventListener('axionix_create_issue', handleOpenCreate);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('axionix_create_issue', handleOpenCreate);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

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

  useGSAP(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (heroRef.current) {
      tl.fromTo(
        heroRef.current,
        { opacity: 0, y: 16, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.65, clearProps: 'filter' },
        0
      );
    }

    if (metricsRef.current) {
      tl.fromTo(
        metricsRef.current.children,
        { opacity: 0, y: 22, filter: 'blur(10px)', scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          scale: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'filter,transform',
        },
        0.15
      );
    }

    if (tasksSectionRef.current) {
      tl.fromTo(
        tasksSectionRef.current,
        { opacity: 0, y: 24, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power3.out',
          clearProps: 'filter',
        },
        0.35
      );
    }
  }, { scope: containerRef });

  useGSAP(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced || !taskListRef.current) return;

    const rows = taskListRef.current.querySelectorAll(`.${styles.taskRow}`);
    if (rows.length > 0) {
      gsap.fromTo(
        rows,
        { opacity: 0, y: 8, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.35,
          stagger: 0.035,
          ease: 'power2.out',
          clearProps: 'filter',
        }
      );
    }
  }, { dependencies: [activeFilter, tasks.length], scope: containerRef });

  useGSAP(() => {
    if (!isModalOpen) return;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    if (modalOverlayRef.current && modalCardRef.current) {
      gsap.fromTo(
        modalOverlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      );
      gsap.fromTo(
        modalCardRef.current,
        { opacity: 0, y: 20, scale: 0.95, filter: 'blur(12px)' },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.35,
          ease: 'back.out(1.2)',
          clearProps: 'filter',
        }
      );
    }
  }, { dependencies: [isModalOpen], scope: containerRef });

  const handleToggleStatus = (e: React.MouseEvent<HTMLButtonElement>, taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'TODO',
    };

    gsap.fromTo(e.currentTarget, { rotate: -35, scale: 0.8 }, { rotate: 0, scale: 1, duration: 0.35, ease: 'back.out(2)' });
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
    <div className={styles.dashboard} ref={containerRef}>
      <div className={styles.ambientGlow} />

      <section className={styles.heroRow} ref={heroRef}>
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

      <section className={styles.metricsGrid} ref={metricsRef}>
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

      <section className={styles.tasksSection} ref={tasksSectionRef}>
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

        <div className={styles.taskList} ref={taskListRef}>
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
                    onClick={(e) => handleToggleStatus(e, task.id, task.status)}
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
        <div 
          className={styles.modalOverlay} 
          ref={modalOverlayRef} 
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className={styles.modalCard} 
            ref={modalCardRef} 
            onClick={(e) => e.stopPropagation()}
          >
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
