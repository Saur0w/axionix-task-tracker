export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | 'ALL';
  priority?: TaskPriority | 'ALL';
  assigneeId?: string | 'ALL';
  sortBy?: 'dueDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
