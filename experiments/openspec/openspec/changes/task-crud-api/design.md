## 背景

TaskFlow 是一个全新项目，无现有代码。MVP 需要 Task CRUD REST API 以支持前端开发。种子阶段团队（2名开发者）需要一个简单、可维护的架构，能随产品发展而演进。

## 目标 / 非目标

**目标:**
- 为 Task CRUD 操作提供清晰的 REST API
- 强制执行 Task 状态机转换规则
- 返回结构化、一致的 API 响应
- 支持后续从内存存储轻松切换为数据库

**非目标:**
- 认证/授权（未来里程碑）
- 持久化数据库存储（MVP 使用内存 Map）
- 任务分配或用户管理
- 实时更新或 WebSocket 支持

## 决策

### 1. 分层架构: routes → validators → services
**理由**: 每层单一职责。Routes 处理 HTTP 关注点（状态码、响应格式）。Validators 确保输入正确性。Services 包含纯业务逻辑，无 HTTP 知识。这使每层可独立测试和替换。

**考虑的替代方案**: 单文件处理器（拒绝 — 混合 HTTP 和业务逻辑，难以测试）。

### 2. 内存 Map 作为存储
**理由**: 零设置、即时测试、可轻松替换。`TaskStore` 是普通 `Map<string, Task>` 包裹在纯函数中。迁移到数据库时只需改 service 层。

**考虑的替代方案**: SQLite（拒绝 — 增加依赖和 MVP 设置复杂度）。

### 3. 函数式服务层（无类）
**理由**: 每个操作是独立纯函数: `createTask(store, input) => Task`。无共享可变状态，无 `this` 绑定问题，测试简单 — 调用函数，检查返回值。

### 4. Express 错误中间件集中处理错误
**理由**: 领域错误（ValidationError, NotFoundError）从 services 抛出。单个 errorHandler 中间件捕获、映射到 HTTP 状态码，返回 ApiResponse 信封。路由处理器中无需 try-catch。

### 5. UUID v4 作为 Task ID
**理由**: 全局唯一，无顺序 ID 猜测风险，无需协调。

## 风险 / 权衡

- **[内存存储]** 重启丢失数据 → 缓解: 文档化 MVP 限制；存储层设计为易于替换为数据库
- **[无认证]** 任何人都能访问 API → 缓解: 认证计划在下个里程碑；API 仅内部 Alpha 使用
