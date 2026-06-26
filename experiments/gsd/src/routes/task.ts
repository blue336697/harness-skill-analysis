// Task route handlers

import { Router } from 'express';
import type { Request, Response } from 'express';
import type { TaskStore } from '../services/task.js';
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../services/task.js';
import { validateCreateTask, validateUpdateTask } from '../validators/task.js';
import type { ApiResponse, PaginatedResponse, Task } from '../types/task.js';

export function createTaskRouter(store: TaskStore): Router {
  const router = Router();

  // POST /api/v1/tasks — Create a task
  router.post('/api/v1/tasks', (req: Request, res: Response) => {
    const input = validateCreateTask(req.body);
    const task = createTask(store, input);
    const response: ApiResponse<Task> = { success: true, data: task, error: null };
    res.status(201).json(response);
  });

  // GET /api/v1/tasks — List tasks with optional status filter and pagination
  router.get('/api/v1/tasks', (req: Request, res: Response) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    const result = listTasks(store, { status, offset, limit });
    const response: PaginatedResponse<Task> = {
      success: true,
      data: result.tasks,
      error: null,
      meta: {
        total: result.total,
        offset: result.offset,
        limit: result.limit,
      },
    };
    res.json(response);
  });

  // GET /api/v1/tasks/:id — Get a single task
  router.get('/api/v1/tasks/:id', (req: Request, res: Response) => {
    const task = getTask(store, req.params.id);
    const response: ApiResponse<Task> = { success: true, data: task, error: null };
    res.json(response);
  });

  // PATCH /api/v1/tasks/:id — Update a task
  router.patch('/api/v1/tasks/:id', (req: Request, res: Response) => {
    const input = validateUpdateTask(req.body);
    const task = updateTask(store, req.params.id, input);
    const response: ApiResponse<Task> = { success: true, data: task, error: null };
    res.json(response);
  });

  // DELETE /api/v1/tasks/:id — Delete a task
  router.delete('/api/v1/tasks/:id', (req: Request, res: Response) => {
    deleteTask(store, req.params.id);
    res.status(204).send();
  });

  return router;
}
