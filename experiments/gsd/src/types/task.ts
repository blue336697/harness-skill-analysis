// Task domain types

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

// Input types with strict constraints
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}

// API response envelope types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  error: null;
  meta: {
    total: number;
    offset: number;
    limit: number;
  };
}

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}
