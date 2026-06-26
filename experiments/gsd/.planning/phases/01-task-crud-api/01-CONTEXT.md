# 阶段 1: Task CRUD API - 上下文

**收集日期:** 2026-06-16
**状态:** 准备规划

<domain>
## 阶段边界

交付一个可工作的 Express 服务器，包含5个 REST 端点用于 Task CRUD 操作。包括输入校验、状态机强制执行、统一 ApiResponse 信封和错误处理中间件。MVP 使用内存 Map 存储。7个集成测试覆盖所有端点和错误场景。
</domain>

<decisions>
## 实现决策

### 架构
- **D-01:** 分层架构: routes（HTTP）→ validators（输入检查）→ services（纯函数+Store）
- **D-02:** 每层是一个模块，单一职责
- **D-03:** 函数式依赖注入: Store（Map）作为首参传递给所有 service 函数

### 存储
- **D-04:** MVP 使用内存 Map<string, Task>
- **D-05:** Store 可替换为数据库 — 仅需改 service 层，routes 和 validators 不变

### 数据模型
- **D-06:** Task id 为 UUID v4，服务端创建时生成
- **D-07:** 状态默认 'todo'，优先级默认 'medium'，描述默认 ''
- **D-08:** 时间戳为 ISO 8601 格式，每次更新时 updatedAt 变更

### API 设计
- **D-09:** 所有响应用 ApiResponse 信封: { success, data, error }
- **D-10:** 分页响应增加 meta: { total, offset, limit }
- **D-11:** 5个端点: POST（创建）、GET（列表）、GET/:id（获取）、PATCH/:id（更新）、DELETE/:id（删除）

### 校验
- **D-12:** 标题必须为 1-200 字符
- **D-13:** PATCH 更新至少需要一个字段
- **D-14:** 状态转换按 ALLOWED_TRANSITIONS map 校验
- **D-15:** 允许: todo↔in_progress, in_progress→done, done→todo。禁止: todo→done, done→in_progress

### 错误处理
- **D-16:** AppError 基类含 statusCode
- **D-17:** ValidationError（400）用于输入/转换错误，NotFoundError（404）用于缺失 Task
- **D-18:** 全局 errorHandler 中间件捕获 AppError → 映射到 HTTP 状态码+信封
- **D-19:** 未处理错误 → 500 + 通用消息（记录到控制台）

### 测试
- **D-20:** 仅集成测试: 启动服务器、fetch() HTTP 请求、断言响应
- **D-21:** 无模拟、无单元测试。真实 Store、真实 HTTP
- **D-22:** node:test + node:assert（仅 Node.js 内置工具）

### AI 自主决定范围
- src/ 内部的具体文件组织
- 导入顺序和代码格式
- 错误消息措辞（在规范约束内）
</decisions>

<canonical_refs>
## 规范引用

### 需求
- `.planning/REQUIREMENTS.md` — 6个功能需求，含输入/输出/错误规格
- `.planning/PROJECT.md` — 项目上下文、约束、关键决策

### 外部规范
- `../experiments/common-specs.md` — 通用实验规范（数据模型、API设计、代码标准）
</canonical_refs>

<deferred>
## 推迟的想法

- 认证/授权 — 阶段 2
- 数据库迁移（PostgreSQL）— 阶段 3
- 任务分配、评论、附件 — 未来里程碑
- 速率限制 — 上线时添加
</deferred>

---
*阶段: 01-task-crud-api*
*上下文收集: 2026-06-16*
