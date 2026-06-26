// Express application configuration

import express from 'express';
import { createTaskStore } from './services/task.js';
import { createTaskRouter } from './routes/task.js';
import { errorHandler } from './middleware/error.js';

export function createApp(): express.Express {
  const app = express();
  const store = createTaskStore();

  app.use(express.json());
  app.use(createTaskRouter(store));
  app.use(errorHandler);

  return app;
}
