# TaskFlow API 实施计划

> **给自动化工作者的说明:** 必需子技能: 使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 按任务逐步实施此计划。步骤使用复选框（`- [ ]`）语法追踪。

**目标:** 构建一个 Task CRUD REST API，拥有5个端点、内存存储和严格 TypeScript 类型。

**架构:** 分层函数式架构: routes（HTTP）→ validators（输入检查）→ services（纯函数+Map store）。Express 错误中间件集中处理错误。

**技术栈:** TypeScript 5.x strict 模式, Node.js 20 LTS, Express.js 4.x, uuid v10, tsx (开发), node:test + node:assert

---

### 任务 1: 项目搭建与类型定义

**文件:**
- 创建: `package.json`, `tsconfig.json`
- 创建: `src/types/task.ts`

- [ ] **步骤 1.1: 创建 package.json（含所有依赖）**
- [ ] **步骤 1.2: 创建 tsconfig.json（strict 模式）**
- [ ] **步骤 1.3: 运行 pnpm install**
- [ ] **步骤 1.4: 编写类型定义**

```typescript
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export interface Task { id: string; title: string; description: string; status: TaskStatus; priority: TaskPriority; createdAt: string; updatedAt: string; }
export interface CreateTaskInput { title: string; description?: string; priority?: TaskPriority; }
export interface UpdateTaskInput { title?: string; description?: string; priority?: TaskPriority; status?: TaskStatus; }
export interface ApiResponse<T> { success: boolean; data: T | null; error: string | null; }
export class AppError extends Error { constructor(message: string, public statusCode: number) { super(message); } }
export class ValidationError extends AppError { constructor(message: string) { super(message, 400); } }
export class NotFoundError extends AppError { constructor(message: string) { super(message, 404); } }
```

- [ ] **步骤 1.5: 提交**

---

### 任务 2: 输入校验器

**文件:**
- 创建: `src/validators/task.ts`

- [ ] **步骤 2.1: 为 validateCreateTask 编写失败测试**
- [ ] **步骤 2.2: 运行测试 — 确认失败（RED）**
- [ ] **步骤 2.3: 实现 validateCreateTask**
- [ ] **步骤 2.4: 运行测试 — 确认通过（GREEN）**
- [ ] **步骤 2.5: 实现 validateUpdateTask 和 validateStatusTransition**（同样 RED→GREEN 循环）

```typescript
const ALLOWED_TRANSITIONS: Record<TaskStatus, Set<TaskStatus>> = {
  todo: new Set(['in_progress']),
  in_progress: new Set(['todo', 'done']),
  done: new Set(['todo']),
};
export function validateStatusTransition(current: TaskStatus, next: TaskStatus): void {
  if (!ALLOWED_TRANSITIONS[current].has(next)) {
    throw new ValidationError(`无效的状态转换: '${current}' -> '${next}'`);
  }
}
```

- [ ] **步骤 2.6: 提交**

---

### 任务 3: 服务层（纯函数）

**文件:**
- 创建: `src/services/task.ts`

- [ ] **步骤 3.1: 为 createTask 编写失败测试**
- [ ] **步骤 3.2: 实现 createTask(store, input): Task** — 生成 UUID、设置默认值、添加到 store
- [ ] **步骤 3.3: 实现 listTasks(store, filter?): { tasks, total, offset, limit }** — 含分页
- [ ] **步骤 3.4: 实现 getTask(store, id): Task** — 缺失时抛出 NotFoundError
- [ ] **步骤 3.5: 实现 updateTask(store, id, input): Task** — 校验转换、不可变更新
- [ ] **步骤 3.6: 实现 deleteTask(store, id): void** — 缺失时抛出 NotFoundError
- [ ] **步骤 3.7: 实现 createTaskStore(): Map<string, Task>**
- [ ] **步骤 3.8: 所有测试通过 → 提交**

---

### 任务 4: Express 路由与中间件

**文件:**
- 创建: `src/routes/task.ts`
- 创建: `src/middleware/error.ts`

- [ ] **步骤 4.1: 实现 createTaskRouter(store): Router** — 5个端点处理器
- [ ] **步骤 4.2: 实现 errorHandler 中间件** — AppError → HTTP 状态码映射
- [ ] **步骤 4.3: 提交**

---

### 任务 5: 应用入口与组装

**文件:**
- 创建: `src/app.ts`
- 创建: `src/index.ts`

- [ ] **步骤 5.1: 编写完整 API 流程的集成测试**（设计文档中的7个测试用例）
- [ ] **步骤 5.2: 运行测试 — 确认失败（尚无 app）**
- [ ] **步骤 5.3: 实现 createApp(): Express** — JSON 解析、路由、错误中间件
- [ ] **步骤 5.4: 实现 index.ts** — 可配置 PORT、服务器启动
- [ ] **步骤 5.5: 运行测试 — 全部7个通过**
- [ ] **步骤 5.6: 提交**

---

### 任务 6: 手动验证与润色

- [ ] **步骤 6.1: 启动服务器，对全部5个端点运行 curl**
- [ ] **步骤 6.2: 用 curl 验证状态机转换**
- [ ] **步骤 6.3: 验证错误响应信封格式**
- [ ] **步骤 6.4: 提交最终变更**
