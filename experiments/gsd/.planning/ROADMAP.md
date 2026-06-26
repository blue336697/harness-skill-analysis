# 路线图 — TaskFlow API

## 里程碑 1: 核心 Task CRUD API (MVP)

### 阶段 1: Task CRUD API
**目标**: 构建5个 REST 端点，含校验、状态机和错误处理。
**交付物**: 可工作的 Express 服务器（完整 Task CRUD），7个集成测试通过
**规范引用**: experiments/common-specs.md

### 阶段 2: 认证 (未来)
**目标**: 添加 JWT 认证保护 Task 端点。
**依赖**: 阶段 1

### 阶段 3: 数据库迁移 (未来)
**目标**: 将内存 Map Store 替换为 PostgreSQL。
**依赖**: 阶段 1

---
*创建: 2026-06-16*
