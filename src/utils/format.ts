const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86_400_000;

/** `task-7` -> `AX-7`. Falls back to the last 4 digits for legacy timestamp IDs. */
export function formatTaskKey(id: string): string {
  const match = /^task-(\d+)$/.exec(id);
  if (match && match[1].length <= 5) return `AX-${Number(match[1])}`;
  const digits = id.replace(/\D/g, '');
  return `AX-${digits.slice(-4) || id.slice(-4)}`;
}

/** Parse `YYYY-MM-DD` as a local calendar date (avoids the UTC off-by-one shift). */
export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** `YYYY-MM-DD` for a local date, suitable for `<input type="date">`. */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type DueTone = 'overdue' | 'soon' | 'normal' | 'muted';

export interface DueInfo {
  label: string;
  tone: DueTone;
  title: string;
}

/** Human-friendly due date: "Today", "Tomorrow", "Oct 5", flagged when overdue. */
export function getDueInfo(dueDate: string, isDone: boolean, now: Date = new Date()): DueInfo {
  const due = parseLocalDate(dueDate);
  if (!due) return { label: 'No date', tone: 'muted', title: 'No due date' };

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((due.getTime() - today.getTime()) / DAY_MS);
  const short = `${MONTHS[due.getMonth()]} ${due.getDate()}`;

  if (isDone) return { label: short, tone: 'muted', title: `Was due ${short}` };
  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    return { label: short, tone: 'overdue', title: `Overdue by ${days} day${days === 1 ? '' : 's'}` };
  }
  if (diffDays === 0) return { label: 'Today', tone: 'soon', title: 'Due today' };
  if (diffDays === 1) return { label: 'Tomorrow', tone: 'soon', title: 'Due tomorrow' };
  return { label: short, tone: 'normal', title: `Due ${short}` };
}

/** "Saurabh Thapliyal" -> "ST", "Asta" -> "AS". */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
