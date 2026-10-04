'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { useToast } from '@/context/ToastContext';
import { TaskPriority, TaskStatus } from '@/types';
import { formatTaskKey, toDateInputValue } from '@/utils/format';
import { CREATE_TASK_EVENT, CreateTaskDefaults } from './events';
import styles from './style.module.scss';

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const TITLE_REQUIRED = 'Give the issue a title.';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export default function CreateTaskModal() {
  const { projects, users, createTask } = useTasks();
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const headingId = useId();
  const errorId = useId();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('user-1');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(
    (defaults?: CreateTaskDefaults) => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.open) return;

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      flushSync(() => {
        setTitle('');
        setDescription('');
        setProjectId(defaults?.projectId ?? projects[0]?.id ?? '');
        setStatus(defaults?.status ?? 'TODO');
        setPriority('MEDIUM');
        setAssigneeId(defaults?.assigneeId ?? 'user-1');
        setDueDate(toDateInputValue(nextWeek));
        setError(null);
        setSubmitting(false);
      });

      dialog.showModal();
      titleRef.current?.focus();
    },
    [projects]
  );

  useEffect(() => {
    dialogRef.current?.setAttribute('closedby', 'any');
  }, []);

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const supportsClosedBy = 'closedBy' in HTMLDialogElement.prototype;
    if (!supportsClosedBy && e.target === e.currentTarget) e.currentTarget.close();
  };

  useEffect(() => {
    const onOpenEvent = (e: Event) => open((e as CustomEvent<CreateTaskDefaults | undefined>).detail);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'c' || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (isTypingTarget(e.target) || document.querySelector('dialog[open]')) return;
      e.preventDefault();
      open();
    };

    window.addEventListener(CREATE_TASK_EVENT, onOpenEvent);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener(CREATE_TASK_EVENT, onOpenEvent);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const close = () => dialogRef.current?.close();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError(TITLE_REQUIRED);
      titleRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const task = await createTask({
        title: trimmed,
        description: description.trim(),
        projectId,
        status,
        priority,
        assigneeId,
        dueDate,
      });
      close();
      toast({ variant: 'success', title: `${formatTaskKey(task.id)} created`, description: trimmed });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.currentTarget.requestSubmit();
    }
  };

  const projectName = projects.find((p) => p.id === projectId)?.name ?? 'Axionix';

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={headingId}
      onClick={handleDialogClick}
    >
      <form className={styles.panel} onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} noValidate>
        <header className={styles.header}>
          <p className={styles.crumbs}>
            <span className={styles.crumbProject}>{projectName}</span>
            <span className={styles.crumbSep} aria-hidden="true">›</span>
            <span id={headingId} className={styles.crumbCurrent}>New issue</span>
          </p>
          <button type="button" onClick={close} className={styles.iconBtn} aria-label="Close">
            <X size={15} strokeWidth={1.75} />
          </button>
        </header>

        <div className={styles.body}>
          <label className={styles.srOnly} htmlFor="create-task-title">Issue title</label>
          <input
            ref={titleRef}
            id="create-task-title"
            type="text"
            autoComplete="off"
            placeholder="Issue title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.titleInput}
            aria-invalid={error === TITLE_REQUIRED}
            aria-describedby={error ? errorId : undefined}
          />

          <label className={styles.srOnly} htmlFor="create-task-description">Description</label>
          <textarea
            id="create-task-description"
            placeholder="Add description…"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.descriptionInput}
          />
        </div>

        <div className={styles.properties}>
          <label className={styles.pill}>
            <span className={styles.pillLabel}>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <label className={styles.pill}>
            <span className={styles.pillLabel}>Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <label className={styles.pill}>
            <span className={styles.pillLabel}>Assignee</span>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </label>

          <label className={styles.pill}>
            <span className={styles.pillLabel}>Project</span>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>

          <label className={styles.pill}>
            <span className={styles.pillLabel}>Due</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
        </div>

        <footer className={styles.footer}>
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>

          <div className={styles.actions}>
            <span className={styles.hint} aria-hidden="true">
              <kbd>Ctrl</kbd>
              <kbd>Enter</kbd>
            </span>
            <button type="button" onClick={close} className={styles.secondaryBtn}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={submitting}>
              {submitting && <Loader2 size={13} className={styles.spinner} aria-hidden="true" />}
              <span>{submitting ? 'Creating…' : 'Create issue'}</span>
            </button>
          </div>
        </footer>
      </form>
    </dialog>
  );
}
