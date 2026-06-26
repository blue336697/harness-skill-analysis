## 为什么做

TaskFlow 正在构建一个项目管理 SaaS，需要其核心领域实体 —— Task —— 通过 REST API 暴露出来。MVP 需要完整的 CRUD 操作和状态工作流来支持内部 Alpha 版本。没有这个 API，前端开发无法启动。

## 改什么

- **新增**: Task CRUD REST API，5个端点（创建、列表、获取、更新、删除）
- **新增**: Task 状态机（`todo` → `in_progress` → `done`）含状态转换校验
- **新增**: 请求校验层，含结构化错误响应
- **新增**: 统一 API 响应信封（`ApiResponse<T>` 和 `PaginatedResponse<T>`）
- **新增**: MVP 阶段使用内存存储（为后续数据库替换设计）

## 能力

### 新增能力
- `task-crud`: 核心任务管理 — 创建、查询、更新、删除任务，包含状态工作流和校验。涵盖 Task 数据模型、REST 端点、输入校验、状态机和错误处理。

### 修改的能力
<!-- 无 — 这是一个全新项目，无现有规格 -->

## 影响

- **代码**: 新建 Express 应用，含路由（`src/routes/task.ts`）、服务（`src/services/task.ts`）、校验器（`src/validators/task.ts`）、类型（`src/types/task.ts`）和错误中间件（`src/middleware/error.ts`）
- **依赖**: express, uuid, tsx (开发), TypeScript (开发), 类型定义 (开发)
- **测试**: 使用 curl 对运行中的服务器进行集成测试，不使用模拟
- **API 契约**: `/api/v1/tasks` 端点为所有后续前端工作建立了契约
