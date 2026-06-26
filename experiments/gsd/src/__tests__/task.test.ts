// Task API integration tests

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { createApp } from '../app.js';
import type { Express } from 'express';
import type { Server } from 'node:http';

let app: Express;
let server: Server;
let baseUrl: string;

before(async () => {
  app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://localhost:${addr.port}`;
      }
      resolve();
    });
  });
});

after(() => {
  server.close();
});

async function fetchJson(url: string, options?: RequestInit): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  return { status: res.status, body };
}

describe('Task CRUD API', () => {
  // 8.1: Create task with valid input
  it('should create a task with valid input', async () => {
    const { status, body } = await fetchJson(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Buy groceries', priority: 'high' }),
    });
    assert.strictEqual(status, 201);
    const data = (body as { data: Record<string, unknown> }).data;
    assert.strictEqual(data.title, 'Buy groceries');
    assert.strictEqual(data.priority, 'high');
    assert.strictEqual(data.status, 'todo');
    assert.ok(typeof data.id === 'string' && data.id.length > 0);
    assert.ok(typeof data.createdAt === 'string');
  });

  // 8.2: Create task with empty title
  it('should return 400 for empty title', async () => {
    const { status, body } = await fetchJson(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title: '' }),
    });
    assert.strictEqual(status, 400);
    assert.strictEqual((body as { success: boolean }).success, false);
    assert.ok((body as { error: string }).error.includes('Title'));
  });

  // 8.3: List tasks
  it('should list tasks with pagination', async () => {
    const { status, body } = await fetchJson(`${baseUrl}/api/v1/tasks`);
    assert.strictEqual(status, 200);
    const data = body as { success: boolean; data: unknown[]; meta: { total: number; offset: number; limit: number } };
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.meta.total >= 1); // at least the task created above
  });

  // 8.4: List tasks with status filter
  it('should filter tasks by status', async () => {
    // Create a done task first
    await fetchJson(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Done task' }),
    });

    const { body: allBody } = await fetchJson(`${baseUrl}/api/v1/tasks?status=todo`);
    const data = allBody as { data: Array<{ status: string }> };
    for (const task of data.data) {
      assert.strictEqual(task.status, 'todo');
    }
  });

  // 8.5: Get task by ID (success and 404)
  it('should get task by ID and return 404 for non-existent', async () => {
    // Create a task first
    const createRes = await fetchJson(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Get me' }),
    });
    const createData = (createRes.body as { data: { id: string } }).data;
    const taskId = createData.id;

    // Get existing task
    const { status, body } = await fetchJson(`${baseUrl}/api/v1/tasks/${taskId}`);
    assert.strictEqual(status, 200);
    assert.strictEqual((body as { data: { id: string } }).data.id, taskId);

    // Get non-existent task
    const { status: notFoundStatus } = await fetchJson(`${baseUrl}/api/v1/tasks/00000000-0000-0000-0000-000000000000`);
    assert.strictEqual(notFoundStatus, 404);
  });

  // 8.6: Update task and invalid status transition
  it('should update task and reject invalid status transition', async () => {
    const createRes = await fetchJson(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Update me' }),
    });
    const taskId = (createRes.body as { data: { id: string } }).data.id;

    // Valid update
    const { status, body } = await fetchJson(`${baseUrl}/api/v1/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated title' }),
    });
    assert.strictEqual(status, 200);
    assert.strictEqual((body as { data: { title: string } }).data.title, 'Updated title');

    // Invalid transition: todo -> done
    const { status: badStatus } = await fetchJson(`${baseUrl}/api/v1/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'done' }),
    });
    assert.strictEqual(badStatus, 400);
  });

  // 8.7: Delete task
  it('should delete task and return 204', async () => {
    const createRes = await fetchJson(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Delete me' }),
    });
    const taskId = (createRes.body as { data: { id: string } }).data.id;

    // Delete
    const { status } = await fetchJson(`${baseUrl}/api/v1/tasks/${taskId}`, {
      method: 'DELETE',
    });
    assert.strictEqual(status, 204);

    // Verify deleted
    const { status: getStatus } = await fetchJson(`${baseUrl}/api/v1/tasks/${taskId}`);
    assert.strictEqual(getStatus, 404);
  });
});
