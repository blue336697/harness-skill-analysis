// Task input validators

import type { CreateTaskInput, UpdateTaskInput, TaskStatus } from '../types/task.js';
import { ValidationError } from '../types/task.js';

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 200;
const VALID_STATUSES: ReadonlySet<string> = new Set(['todo', 'in_progress', 'done']);
const VALID_PRIORITIES: ReadonlySet<string> = new Set(['low', 'medium', 'high']);

// Status transition map: from -> set of allowed 'to' statuses
const ALLOWED_TRANSITIONS: Readonly<Record<TaskStatus, ReadonlySet<TaskStatus>>> = {
  todo: new Set(['in_progress']),
  in_progress: new Set(['todo', 'done']),
  done: new Set(['todo']),
};

export function validateCreateTask(input: unknown): CreateTaskInput {
  if (typeof input !== 'object' || input === null) {
    throw new ValidationError('Request body must be a JSON object');
  }

  const { title, description, priority } = input as Record<string, unknown>;

  if (typeof title !== 'string' || title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) {
    throw new ValidationError(`Title must be ${TITLE_MIN_LENGTH}-${TITLE_MAX_LENGTH} characters`);
  }

  if (description !== undefined && typeof description !== 'string') {
    throw new ValidationError('Description must be a string');
  }

  if (priority !== undefined && (typeof priority !== 'string' || !VALID_PRIORITIES.has(priority))) {
    throw new ValidationError('Priority must be one of: low, medium, high');
  }

  return {
    title,
    description: description ?? '',
    priority: (priority as CreateTaskInput['priority']) ?? 'medium',
  };
}

export function validateUpdateTask(input: unknown): UpdateTaskInput {
  if (typeof input !== 'object' || input === null) {
    throw new ValidationError('Request body must be a JSON object');
  }

  const { title, description, priority, status } = input as Record<string, unknown>;
  const result: UpdateTaskInput = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) {
      throw new ValidationError(`Title must be ${TITLE_MIN_LENGTH}-${TITLE_MAX_LENGTH} characters`);
    }
    result.title = title;
  }

  if (description !== undefined) {
    if (typeof description !== 'string') {
      throw new ValidationError('Description must be a string');
    }
    result.description = description;
  }

  if (priority !== undefined) {
    if (typeof priority !== 'string' || !VALID_PRIORITIES.has(priority)) {
      throw new ValidationError('Priority must be one of: low, medium, high');
    }
    result.priority = priority as UpdateTaskInput['priority'];
  }

  if (status !== undefined) {
    if (typeof status !== 'string' || !VALID_STATUSES.has(status)) {
      throw new ValidationError('Status must be one of: todo, in_progress, done');
    }
    result.status = status as TaskStatus;
  }

  if (Object.keys(result).length === 0) {
    throw new ValidationError('At least one field must be provided');
  }

  return result;
}

export function validateStatusTransition(current: TaskStatus, next: TaskStatus): void {
  const allowed = ALLOWED_TRANSITIONS[current];
  if (!allowed.has(next)) {
    throw new ValidationError(
      `Invalid status transition: '${current}' -> '${next}'. Allowed transitions from '${current}': ${[...allowed].join(', ')}`
    );
  }
}
