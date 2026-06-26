// Global error handling middleware

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/task.js';
import type { ApiResponse } from '../types/task.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  console.error('Unhandled error:', err);
  const response: ApiResponse<null> = {
    success: false,
    data: null,
    error: 'Internal server error',
  };
  res.status(500).json(response);
}
