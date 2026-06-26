# PRD: Task CRUD REST API

**状态**: ready-for-agent
**创建**: 2026-06-16

## 问题陈述

TaskFlow 正在构建项目管理 SaaS。前端团队在没有稳定 Task API 的情况下无法开始开发。种子阶段团队（2名开发者）需要一个简单、可维护的 MVP，提供核心 Task 管理能力。

## 解决方案

一个包含5个端点的 REST API，用于 Task CRUD 操作。Task 通过状态机流转（todo → in_progress → done）。MVP 使用内存存储，为后续数据库替换设计。采用函数式编程和严格 TypeScript 类型。

## 用户故事

1. 作为 API 消费者，我想要创建一个带标题的 Task，以便在系统中跟踪工作项
2. 作为 API 消费者，我想要列出所有 Tasks，以便查看存在哪些工作
3. 作为 API 消费者，我想要按 Status 过滤 Tasks，以便聚焦特定生命周期状态的工作
4. 作为 API 消费者，我想要分页 Task 列表，以便高效处理大量 Tasks
5. 作为 API 消费者，我想要按 id 获取单个 Task，以便查看其详情
6. 作为 API 消费者，我想要更新 Task 的字段，以便保持信息最新
7. 作为 API 消费者，我想要更改 Task 的 Status，以便跟踪其生命周期
8. 作为 API 消费者，我想要系统拒绝无效的 Status Transition，以便避免意外破坏 Task 状态
9. 作为 API 消费者，我想要删除 Task，以便移除不相关的工作
10. 作为 API 消费者，我想要一致的错误响应，以便在客户端代码中可预测地处理错误

## 实现决策

- **架构**: 分层（routes → validators → services）。每层是一个单一职责的模块
- **Store**: 内存 `Map<string, Task>`，通过函数式依赖注入传递。参见 ADR-0001
- **转换校验**: 服务端强制执行状态机。禁止的转换返回 400
- **信封**: 所有响应使用 `{ success, data, error }` 格式。分页响应增加 `meta`
- **ID**: UUID v4，服务端创建时生成
- **错误模型**: AppError 基类 → ValidationError（400）/ NotFoundError（404）。全局 errorHandler 中间件
- **无认证**: MVP 仅内部 Alpha 使用。认证计划在下个里程碑

## 测试决策

- 仅集成测试: 启动服务器，通过 `fetch()` 发起 HTTP 请求，断言响应
- 在 HTTP 接缝处测试 — 可用的最高接缝
- 无模拟或桩。真实 Store，真实 HTTP
- 7个测试用例覆盖: 有效创建、空标题拒绝、分页列表、状态过滤、获取存在/不存在、更新/转换拒绝、删除/验证已删除
- `node:test` + `node:assert`（不依赖 Node.js 内置之外的测试框架）

## 超出范围

- 认证和授权
- 用户管理或 Task 分配
- 持久化数据库存储（MVP 使用内存 Map）
- 实时更新或 WebSocket 通知
- 批量操作（批量创建/更新/删除）
- Task 评论、附件或子任务

## 补充说明

- Store 抽象（通过首参的函数式依赖注入）是关键的架构决策，使未来数据库迁移无需触及 routes 或 validators
- 规范领域语言定义见 `CONTEXT.md`
- 存储决策理由见 `docs/adr/0001-in-memory-store-for-mvp.md`
