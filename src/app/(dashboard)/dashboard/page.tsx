'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  FolderKanban, 
  Flame, 
  ArrowUpRight, 
  Sparkles,
  Trash2,
  AlertCircle,
  X
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTasks } from '@/context/TaskContext';
import { useSearch } from '@/context/SearchContext';
import { useToast } from '@/context/ToastContext';
import { openCreateTaskModal } from '@/components/features/tasks/CreateTaskModal/events';
import { formatTaskKey, getDueInfo, getInitials } from '@/utils/format';
import { TaskStatus } from '@/types';
import styles from './style.module.scss';

gsap.registerPlugin(useGSAP);

export default function DashboardPage() {
  const { tasks, projects, users, updateTaskStatus, deleteTask } = useTasks();
  const { query, setQuery } = useSearch();
  const { toast } = useToast();
  
  const [activeFilter, setActiveFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [shouldCrash, setShouldCrash] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const metricsRef = useRef<HTMLElement>(null);
  const tasksSectionRef = useRef<HTMLElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);

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
    const normalizedQuery = query.trim().toLowerCase();

    return tasks.filter((task) => {
      if (activeFilter !== 'ALL' && task.status !== activeFilter) {
        return false;
      }

      if (normalizedQuery) {
        const key = formatTaskKey(task.id).toLowerCase();
        const title = task.title.toLowerCase();
        const desc = (task.description || '').toLowerCase();
        const project = projects.find((p) => p.id === task.projectId)?.name.toLowerCase() || '';
        const assignee = users.find((u) => u.id === task.assigneeId)?.name.toLowerCase() || '';

        const matches = 
          key.includes(normalizedQuery) ||
          title.includes(normalizedQuery) ||
          desc.includes(normalizedQuery) ||
          project.includes(normalizedQuery) ||
          assignee.includes(normalizedQuery);

        if (!matches) return false;
      }

      return true;
    });
  }, [tasks, activeFilter, query, projects, users]);

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
        { opacity: 0, y: 6, filter: 'blur(4px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.3,
          stagger: 0.03,
          ease: 'power2.out',
          clearProps: 'filter',
        }
      );
    }
  }, { dependencies: [activeFilter], scope: containerRef });

  const handleToggleStatus = async (e: React.MouseEvent<HTMLButtonElement>, taskId: string, currentStatus: TaskStatus) => {
    e.stopPropagation();
    const nextStatusMap: Record<TaskStatus, TaskStatus> = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'TODO',
    };
    const targetStatus = nextStatusMap[currentStatus];

    gsap.fromTo(
      e.currentTarget,
      { rotate: -25, scale: 0.82 },
      { rotate: 0, scale: 1, duration: 0.35, ease: 'back.out(2)' }
    );

    try {
      await updateTaskStatus(taskId, targetStatus);
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Status update failed',
        description: err instanceof Error ? err.message : 'Could not change status',
      });
    }
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: string, taskTitle: string) => {
    e.stopPropagation();
    try {
      await deleteTask(taskId);
      toast({
        variant: 'success',
        title: 'Issue deleted',
        description: `"${taskTitle.slice(0, 32)}${taskTitle.length > 32 ? '…' : ''}" was removed.`,
      });
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Could not delete issue',
      });
    }
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
            onClick={() => openCreateTaskModal()}
            className={styles.primaryBtn}
            title="Create new issue (C)"
          >
            <Plus size={15} strokeWidth={2} />
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
            <FolderKanban size={13} strokeWidth={1.5} />
            <span>Manage Projects</span>
            <ArrowUpRight size={13} strokeWidth={1.5} />
          </Link>
        </div>

        {query.trim() && (
          <div className={styles.searchNotice}>
            <span>
              Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'match' : 'matches'} for{' '}
              <strong>&ldquo;{query}&rdquo;</strong>
            </span>
            <button
              type="button"
              onClick={() => setQuery('')}
              className={styles.clearSearchLink}
            >
              Clear search
            </button>
          </div>
        )}

        <div className={styles.taskList} ref={taskListRef}>
          {filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <Sparkles size={24} className={styles.emptyIcon} />
              <p>
                {query.trim()
                  ? `No issues found matching "${query}".`
                  : 'No issues found in this category.'}
              </p>
              {query.trim() ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className={styles.emptyActionBtn}
                >
                  <X size={13} />
                  <span>Reset Search</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openCreateTaskModal({ status: activeFilter === 'ALL' ? 'TODO' : activeFilter })}
                  className={styles.emptyActionBtn}
                >
                  <Plus size={13} />
                  <span>Create an Issue</span>
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => {
              const project = projects.find((p) => p.id === task.projectId);
              const assignee = users.find((u) => u.id === task.assigneeId);
              const dueInfo = getDueInfo(task.dueDate, task.status === 'DONE');

              return (
                <div key={task.id} className={styles.taskRow}>
                  <button
                    type="button"
                    onClick={(e) => handleToggleStatus(e, task.id, task.status)}
                    className={`${styles.statusToggle} ${styles[task.status.toLowerCase()]}`}
                    title={`Status: ${task.status} (Click to toggle)`}
                    aria-label={`Mark status from ${task.status}`}
                  >
                    {task.status === 'DONE' && <CheckCircle2 size={15} strokeWidth={2} />}
                    {task.status === 'IN_PROGRESS' && <Clock size={15} strokeWidth={2} />}
                    {task.status === 'TODO' && <Circle size={15} strokeWidth={2} />}
                  </button>

                  <span className={`${styles.priorityTag} ${styles[task.priority.toLowerCase()]}`}>
                    {task.priority}
                  </span>
                  <span className={styles.taskKey}>
                    {formatTaskKey(task.id)}
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

                  <div 
                    className={styles.assigneeAvatar}
                    title={assignee ? `${assignee.name} (${assignee.role})` : 'Unassigned'}
                  >
                    {assignee ? getInitials(assignee.name) : '?'}
                  </div>

                  <span 
                    className={`${styles.dueBadge} ${styles[dueInfo.tone]}`}
                    title={dueInfo.title}
                  >
                    {dueInfo.tone === 'overdue' && <AlertCircle size={11} strokeWidth={2} />}
                    {dueInfo.label}
                  </span>

                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTask(e, task.id, task.title)}
                      className={styles.actionIconBtn}
                      title="Delete issue"
                      aria-label="Delete issue"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
