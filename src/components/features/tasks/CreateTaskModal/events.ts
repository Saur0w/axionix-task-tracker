import type { TaskStatus } from '@/types';

export const CREATE_TASK_EVENT = 'axionix:create-task';

export interface CreateTaskDefaults {
  projectId?: string;
  status?: TaskStatus;
}

/** Open the global "New issue" modal from anywhere (header, sidebar, pages). */
export function openCreateTaskModal(defaults?: CreateTaskDefaults) {
  window.dispatchEvent(new CustomEvent<CreateTaskDefaults | undefined>(CREATE_TASK_EVENT, { detail: defaults }));
}
