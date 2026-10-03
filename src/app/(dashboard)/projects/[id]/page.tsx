'use client';

import React, { use, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Circle, 
  Clock, 
  CheckCircle2, 
  FolderKanban, 
  Trash2, 
  ArrowRight, 
  ArrowLeft as ArrowLeftIcon,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTasks } from '@/context/TaskContext';
import { useToast } from '@/context/ToastContext';
import { openCreateTaskModal } from '@/components/features/tasks/CreateTaskModal/events';
import { formatTaskKey, getDueInfo, getInitials } from '@/utils/format';
import { Task, TaskStatus } from '@/types';
import styles from './style.module.scss';

const COLUMNS: { id: TaskStatus; label: string; icon: typeof Circle; className: string }[] = [
  { id: 'TODO', label: 'To Do', icon: Circle, className: styles.todo },
  { id: 'IN_PROGRESS', label: 'In Progress', icon: Clock, className: styles.in_progress },
  { id: 'DONE', label: 'Done', icon: CheckCircle2, className: styles.done },
];

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const { projects, tasks, users, updateTaskStatus, deleteTask } = useTasks();
  const { toast } = useToast();

  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  const totalCount = projectTasks.length;
  const doneCount = projectTasks.filter((t) => t.status === 'DONE').length;
  const rate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  useGSAP(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced || !boardRef.current) return;

    gsap.fromTo(
      boardRef.current.children,
      { opacity: 0, y: 18, filter: 'blur(6px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'filter,transform',
      }
    );
  }, { scope: containerRef });

  if (!project) {
    return (
      <div className={styles.boardContainer}>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2>Project Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            The requested project board ({projectId}) does not exist.
          </p>
          <Link 
            href="/projects" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              marginTop: '16px', 
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleMoveStatus = async (taskId: string, targetStatus: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, targetStatus);
      toast({
        variant: 'success',
        title: 'Status Updated',
        description: `Moved issue to ${targetStatus.replace('_', ' ')}.`,
      });
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Move Failed',
        description: err instanceof Error ? err.message : 'Could not change status',
      });
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    try {
      await deleteTask(taskId);
      toast({
        variant: 'success',
        title: 'Issue Deleted',
        description: `"${title.slice(0, 30)}..." removed from board.`,
      });
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Delete Failed',
        description: err instanceof Error ? err.message : 'Could not delete issue',
      });
    }
  };

  const projectMembers = (project.memberIds || [])
    .map((mId) => users.find((u) => u.id === mId))
    .filter((u): u is typeof users[0] => Boolean(u));

  return (
    <div className={styles.boardContainer} ref={containerRef}>
      <div className={styles.ambientGlow} />

      {/* Header and Controls */}
      <header className={styles.boardHeader}>
        <Link href="/projects" className={styles.navBackLink}>
          <ArrowLeft size={13} />
          <span>Back to Projects</span>
        </Link>

        <div className={styles.headerRow}>
          <div className={styles.titleSection}>
            <div className={styles.titleWrapper}>
              <div className={styles.iconBadge}>
                <FolderKanban size={18} />
              </div>
              <h1 className={styles.heading}>{project.name}</h1>
            </div>
            <p className={styles.description}>{project.description}</p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={() => openCreateTaskModal({ projectId: project.id })}
              className={styles.createBtn}
            >
              <Plus size={14} strokeWidth={2} />
              <span>Add Issue</span>
            </button>
          </div>
        </div>

        {/* Board Meta Bar */}
        <div className={styles.metaBar}>
          <div className={styles.progressMeta}>
            <span>Delivery: {doneCount} of {totalCount} completed ({rate}%)</span>
            <div className={styles.miniBar}>
              <div className={styles.miniFill} style={{ width: `${rate}%` }} />
            </div>
          </div>

          {projectMembers.length > 0 && (
            <div className={styles.membersGroup}>
              <span>Team:</span>
              <div className={styles.avatars}>
                {projectMembers.map((m) => (
                  <div
                    key={m.id}
                    className={styles.avatar}
                    title={`${m.name} (${m.role || 'Member'})`}
                  >
                    {getInitials(m.name)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 3-Column Kanban Board */}
      <div className={styles.kanbanBoard} ref={boardRef}>
        {COLUMNS.map((col) => {
          const colTasks = projectTasks.filter((t) => t.status === col.id);
          const Icon = col.icon;

          return (
            <div key={col.id} className={styles.kanbanColumn}>
              {/* Column Header */}
              <div className={styles.columnHeader}>
                <div className={styles.headerLeft}>
                  <span className={`${styles.statusIndicator} ${col.className}`}>
                    <Icon size={14} strokeWidth={2} />
                  </span>
                  <span className={styles.columnTitle}>{col.label}</span>
                  <span className={styles.countBadge}>{colTasks.length}</span>
                </div>

                <button
                  type="button"
                  onClick={() => openCreateTaskModal({ projectId: project.id, status: col.id })}
                  className={styles.addColumnBtn}
                  title={`Add issue to ${col.label}`}
                  aria-label={`Add issue to ${col.label}`}
                >
                  <Plus size={13} strokeWidth={2} />
                </button>
              </div>

              {/* Column Body with Cards */}
              <div className={styles.columnBody}>
                {colTasks.length === 0 ? (
                  <div className={styles.emptyColumn}>
                    <Sparkles size={18} style={{ opacity: 0.35 }} />
                    <span>No {col.label.toLowerCase()} issues</span>
                    <button
                      type="button"
                      onClick={() => openCreateTaskModal({ projectId: project.id, status: col.id })}
                      className={styles.addEmptyBtn}
                    >
                      <Plus size={11} />
                      <span>Add Issue</span>
                    </button>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const assignee = users.find((u) => u.id === task.assigneeId);
                    const dueInfo = getDueInfo(task.dueDate, task.status === 'DONE');

                    return (
                      <div key={task.id} className={styles.kanbanCard}>
                        {/* Card Header */}
                        <div className={styles.cardHeaderRow}>
                          <div className={styles.keyAndPriority}>
                            <span className={styles.taskKey}>
                              {formatTaskKey(task.id)}
                            </span>
                            <span className={`${styles.priorityTag} ${styles[task.priority.toLowerCase()]}`}>
                              {task.priority}
                            </span>
                          </div>

                          <div className={styles.cardActions}>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id, task.title)}
                              className={styles.actionBtn}
                              title="Delete issue"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h4 className={`${styles.cardTitle} ${task.status === 'DONE' ? styles.strike : ''}`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className={styles.cardDescription}>{task.description}</p>
                        )}

                        {/* Card Footer with Meta & Move Controls */}
                        <div className={styles.cardFooter}>
                          <div className={styles.footerLeft}>
                            <div
                              className={styles.assigneeAvatar}
                              title={assignee ? `${assignee.name} (${assignee.role || 'Member'})` : 'Unassigned'}
                            >
                              {assignee ? getInitials(assignee.name) : '?'}
                            </div>

                            <span
                              className={`${styles.dueBadge} ${styles[dueInfo.tone]}`}
                              title={dueInfo.title}
                            >
                              {dueInfo.tone === 'overdue' && <AlertCircle size={10} />}
                              {dueInfo.label}
                            </span>
                          </div>

                          {/* Quick Status Shift Controls */}
                          <div className={styles.moveControls}>
                            {task.status === 'TODO' && (
                              <button
                                type="button"
                                onClick={() => handleMoveStatus(task.id, 'IN_PROGRESS')}
                                className={styles.moveBtn}
                                title="Move to In Progress"
                              >
                                <span>Start</span>
                                <ArrowRight size={10} />
                              </button>
                            )}

                            {task.status === 'IN_PROGRESS' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleMoveStatus(task.id, 'TODO')}
                                  className={styles.moveBtn}
                                  title="Move back to Todo"
                                >
                                  <ArrowLeftIcon size={10} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveStatus(task.id, 'DONE')}
                                  className={styles.moveBtn}
                                  title="Mark as Done"
                                >
                                  <span>Done</span>
                                  <CheckCircle2 size={10} />
                                </button>
                              </>
                            )}

                            {task.status === 'DONE' && (
                              <button
                                type="button"
                                onClick={() => handleMoveStatus(task.id, 'IN_PROGRESS')}
                                className={styles.moveBtn}
                                title="Re-open issue"
                              >
                                <ArrowLeftIcon size={10} />
                                <span>Re-open</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
