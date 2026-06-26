# ADR-0001: MVP 阶段使用内存 Map 作为 Task Store

**状态**: 已接受
**日期**: 2026-06-16

## 背景

TaskFlow 是一家种子阶段创业公司，正在构建其首个 MVP。Task CRUD API 需要存储方案。考虑了两种选择。

## 决策

MVP 阶段使用内存 `Map<string, Task>` 作为 Store，通过函数式依赖注入访问（所有 service 函数接收 `store` 作为首参）。

## 考虑的替代方案

| 选项 | 优点 | 缺点 |
|------|------|------|
| **内存 Map**（选择） | 零设置、即时测试、无 Docker/依赖、后续可轻松替换 | 重启丢失数据、不支持跨进程并发 |
| SQLite | 持久化、可查询、真实数据库语义 | 增加设置复杂度、迁移工具、MVP 阶段的 schema 设计开销 |
| PostgreSQL | 生产级、并发访问 | 对2人种子团队严重过度、运维负担 |

## 后果

- 服务器重启时数据丢失（Alpha 阶段可接受）
- Store 接口已抽象化: `type TaskStore = Map<string, Task>`，所有 service 函数以 Store 为首参
- 迁移到数据库仅需改 service 层 — routes 和 validators 不受影响
- 测试无需数据库 fixture 或 Docker
