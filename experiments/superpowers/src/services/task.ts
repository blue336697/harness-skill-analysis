// Task service layer — pure functions for task CRUD operations

import { randomUUID } from 'node:crypto';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task.js';
import { NotFoundError } from '../types/task.js';
import { validateStatusTransition } from '../validators/task.js';

export type TaskStore = Map<string, Task>;

export function createTaskStore(): TaskStore {
  return new Map<string, Task>();
}

export function createTask(store: TaskStore, input: CreateTaskInput): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    description: input.description ?? '',
    status: 'todo',
    priority: input.priority ?? 'medium',
    createdAt: now,
    updatedAt: now,
  };
  store.set(task.id, task);
  return task;
}

export function listTasks(
  store: TaskStore,
  filter?: { status?: string; offset?: number; limit?: number }
): { tasks: Task[]; total: number; offset: number; limit: number } {
  const offset = filter?.offset ?? 0;
  const limit = Math.min(filter?.limit ?? 20, 100);
  const allTasks = [...store.values()];

  const filtered = filter?.status
    ? allTasks.filter((t: Task) => t.status === filter.status)
    : allTasks;

  const total = filtered.length;
  const tasks = filtered.slice(offset, offset + limit);

  return { tasks, total, offset, limit };
}

export function getTask(store: TaskStore, id: string): Task {
  const task = store.get(id);
  if (task === undefined) {
    throw new NotFoundError('Task not found');
  }
  return task;
}

export function updateTask(store: TaskStore, id: string, input: UpdateTaskInput): Task {
  const existing = getTask(store, id);

  if (input.status !== undefined) {
    validateStatusTransition(existing.status, input.status);
  }

  const updated: Task = {
    ...existing,
    title: input.title ?? existing.title,
    description: input.description ?? existing.description,
    priority: input.priority ?? existing.priority,
    status: input.status ?? existing.status,
    updatedAt: new Date().toISOString(),
  };

  store.set(id, updated);
  return updated;
}

export function deleteTask(store: TaskStore, id: string): void {
  if (!store.has(id)) {
    throw new NotFoundError('Task not found');
  }
  store.delete(id);
}
