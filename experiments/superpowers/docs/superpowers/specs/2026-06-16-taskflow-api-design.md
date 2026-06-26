# TaskFlow API — 设计文档

**日期**: 2026-06-16
**状态**: 已批准

## 概述

为种子阶段创业公司的项目管理 SaaS 构建 Task CRUD REST API。MVP 范围: 5个端点，内存存储，严格 TypeScript。

## 架构

### 分层架构（routes → validators → services）

```
HTTP 请求
  → Express Router (routes/task.ts)
    → Validator (validators/task.ts) — 输入无效时抛出 ValidationError
      → Service (services/task.ts) — 纯函数，无副作用
        → TaskStore (Map<string, Task>) — 内存存储，可替换
```

**理由**: 每层单一职责。Routes 处理 HTTP 关注点。Validators 确保正确性。Services 包含纯函数形式的业务逻辑。每层可独立测试和替换。

### 组件分解

| 组件 | 文件 | 职责 | 依赖 |
|------|------|------|------|
| Types | `src/types/task.ts` | 所有类型定义 + 错误类 | 无 |
| Validators | `src/validators/task.ts` | 输入校验，状态转换规则 | types |
| Services | `src/services/task.ts` | CRUD 纯函数 + store 工厂 | types, validators |
| Routes | `src/routes/task.ts` | Express 路由处理器，HTTP↔service 桥接 | types, services, validators |
| Middleware | `src/middleware/error.ts` | 全局错误→HTTP 映射 | types |
| App | `src/app.ts` | Express 工厂，组装中间件+路由 | routes, middleware |
| Entry | `src/index.ts` | 服务器启动，可配置 PORT | app |

## 数据模型

```typescript
type TaskStatus = 'todo' | 'in_progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: string;            // UUID v4
  title: string;         // 1-200 字符
  description: string;   // 默认 ""
  status: TaskStatus;    // 默认 "todo"
  priority: TaskPriority;// 默认 "medium"
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601
}
```

## API 设计

| 方法 | 路径 | 用途 | 成功 | 错误 |
|------|------|------|------|------|
| POST | /api/v1/tasks | 创建任务 | 201 + Task | 400（无效输入） |
| GET | /api/v1/tasks | 列出任务 | 200 + 分页响应 | — |
| GET | /api/v1/tasks/:id | 获取任务 | 200 + Task | 404 |
| PATCH | /api/v1/tasks/:id | 更新任务 | 200 + Task | 400（无效输入/转换）, 404 |
| DELETE | /api/v1/tasks/:id | 删除任务 | 204 | 404 |

响应信封: `{ success: boolean, data: T | null, error: string | null }`

### 状态机

```
todo ←→ in_progress → done
  ↑________________________|  (done 可以回到 todo)
```

禁止: todo→done, done→in_progress

## 错误处理

- **ValidationError** (400): 无效输入、空标题、错误的状态转换
- **NotFoundError** (404): Task ID 不存在
- **AppError** (基类): 所有领域错误继承此类
- **全局中间件**: 捕获 AppError → 映射到 HTTP 状态码 + ApiResponse 信封
- **未处理错误**: 500 + 通用消息（记录到控制台）

## 测试策略

- **仅集成测试**: node:test + node:assert，通过 fetch() 对运行中服务器测试
- **无单元测试**: 所有逻辑通过 API 集成测试覆盖
- **无模拟**: 真实 HTTP 请求，真实内存存储
- **7个测试用例**: 覆盖所有端点、正常流程、边界条件、错误场景
- **手动验证**: 全部5个端点 + 状态转换的 curl 命令

## 存储

- **MVP**: 内存 `Map<string, Task>`
- **接口**: `TaskStore` 类型别名，所有 service 函数以 store 为首参
- **迁移路径**: 在 service 层将 Map 替换为数据库 — routes 和 validators 不变
