# TaskFlow API

## 这是什么

一个为种子阶段项目管理 SaaS 构建的任务管理 REST API。为 Tasks（核心领域实体）提供 CRUD 操作，包含状态机和结构化错误处理。面向2人开发团队，交付内部 Alpha MVP。

## 核心价值

前端团队可以依赖的可靠 Task CRUD API。如果其他一切都失败，这5个 REST 端点必须正确工作，并提供一致的错误响应。

## 业务上下文

- **客户**: 内部 Alpha 用户（TaskFlow 团队和早期测试者）
- **收入模式**: SaaS 订阅（MVP 之后）
- **成功指标**: 前端团队能完成所有 Task CRUD 用户故事，无 API 问题
- **策略备注**: 无（种子阶段）

## 需求

### 已验证
（尚无 — 交付后验证）

### 活跃
- [ ] FR-1: 创建 Task（标题必填，描述和优先级可选）
- [ ] FR-2: 列出 Tasks（可选状态过滤 + 分页）
- [ ] FR-3: 按 UUID id 获取单个 Task
- [ ] FR-4: 更新 Task 字段（含状态转换校验）
- [ ] FR-5: 删除 Task（204/404 响应）
- [ ] FR-6: Task 状态机（todo ↔ in_progress → done）

### 超出范围
- 认证/授权 — 推迟到下个里程碑，Alpha 仅内部使用
- 持久化数据库 — MVP 使用内存 Map，为数据库替换设计
- 任务分配、评论、附件 — 未来里程碑

## 上下文

全新项目。无现有代码。种子阶段创业公司，2名开发者。技术环境: Node.js 20 LTS, TypeScript 5.x strict, Express.js 4.x。函数式编程风格，不可变数据模式。架构: 分层（routes → validators → services，全部纯函数）。

## 约束

- **技术栈**: TypeScript 5.x strict, Node.js 20 LTS, Express.js 4.x, uuid v10, tsx (开发)
- **测试框架**: Node.js 内置 node:test + node:assert（不使用 Jest/Mocha）
- **包管理**: pnpm
- **代码风格**: 函数式编程，除错误类型外不使用 OOP 类
- **性能**: 内存存储，除 Express 和 uuid 外无外部依赖
- **兼容性**: REST API, JSON 请求/响应, UTF-8 编码

## 关键决策

| 决策 | 理由 | 结果 |
|------|------|------|
| 内存 Map 作为 Store | 零设置、即时测试、可替换为数据库 | ✓ 良好 |
| 分层架构 | 每层单一职责，独立可测试 | ✓ 良好 |
| 函数式依赖注入（Store 作为首参） | 无需改路由/校验器即可替换数据库 | ✓ 良好 |
| UUID v4 作为 Task id | 全局唯一，无顺序猜测风险 | ✓ 良好 |
| 统一 ApiResponse 信封 | 客户端错误处理一致性 | ✓ 良好 |

---
*最后更新: 2026-06-16 项目初始化后*
