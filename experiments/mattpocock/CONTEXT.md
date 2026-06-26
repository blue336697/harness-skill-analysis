# TaskFlow API — 领域语言

> 规范术语表。所有代码、提交、问题、审查必须一致使用这些术语。

## 核心实体

- **Task（任务）**: 系统中跟踪的一个工作单元。由 UUID v4 `id` 标识。字段: `title`（1-200字符）、`description`（默认 `""`）、`status`（状态）、`priority`（优先级）、`createdAt`、`updatedAt`（ISO 8601）。Task 是聚合根 — 所有操作通过 id 定位。
- **Status（状态）**: Task 的生命周期状态。取值: `todo`、`in_progress`、`done`。创建时默认 `todo`。
- **Priority（优先级）**: Task 的紧急程度。取值: `low`、`medium`、`high`。创建时默认 `medium`。

## 状态机

- **Transition（转换）**: 从一个 Status 到另一个 Status 的有效变更。定义在 `ALLOWED_TRANSITIONS` map 中。禁止的转换抛出 `ValidationError`。
- **允许的转换**: `todo→in_progress`、`in_progress→todo`、`in_progress→done`、`done→todo`。
- **禁止的转换**: `todo→done`（必须经过 `in_progress`）、`done→in_progress`（必须先回到 `todo`）。

## 架构

- **Store（存储）**: Task 持久化的数据访问抽象。定义为 `type TaskStore = Map<string, Task>`。所有 service 函数接收 Store 作为首参（函数式依赖注入）。此接口可替换为数据库而不需修改任何 route 或 validator 代码。
- **Module（模块）**: 单一职责的文件。项目使用7个模块: `types`（类型定义+错误类）、`validators`（输入校验+转换规则）、`services`（纯CRUD函数）、`routes`（Express HTTP处理器）、`middleware`（错误→HTTP映射）、`app`（Express工厂）、`index`（服务入口）。
- **Service（服务）**: `services/` 模块中的纯函数。接收 Store 和输入，返回数据或抛出 AppError。绝不涉及 HTTP 关注点（req/res）。除 Store 参数外无副作用。
- **Validator（校验器）**: `validators/` 模块中的函数。检查输入正确性，失败时抛出 `ValidationError`。成功时返回类型化、已验证的输入对象。

## API 契约

- **Envelope（信封）**: 统一响应格式 `{ success: boolean, data: T | null, error: string | null }`。每个端点都返回此格式。分页响应增加 `meta` 字段（`total`、`offset`、`limit`）。
- **Endpoint（端点）**: 5个 REST 操作之一: `POST /api/v1/tasks`（创建）、`GET /api/v1/tasks`（列表）、`GET /api/v1/tasks/:id`（获取）、`PATCH /api/v1/tasks/:id`（更新）、`DELETE /api/v1/tasks/:id`（删除）。

## 错误模型

- **AppError**: 含 `statusCode` 属性的基础错误类。所有领域错误继承此类。`errorHandler` 中间件捕获 `AppError` 实例并自动映射到 HTTP 响应。
- **ValidationError** (400): 输入不满足约束（空标题、无效优先级、禁止的转换）。
- **NotFoundError** (404): 请求的 Task id 在 Store 中不存在。
- **未处理错误** (500): 任何不继承 AppError 的错误。记录到控制台，返回通用消息给客户端。
