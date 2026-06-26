# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaskFlow API — 任务管理 REST API，为种子阶段项目管理 SaaS 提供 Task CRUD 操作。MVP 范围：5个端点，内存存储，严格 TypeScript。

## Commands

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器 (tsx watch)
pnpm build            # TypeScript 编译
pnpm test             # 运行集成测试 (node:test + tsx)
pnpm test -- --test-name-pattern="create"  # 运行单个测试
```

## Architecture

分层函数式架构：

```
HTTP Request → routes (Express handlers)
             → validators (input checks, throws ValidationError)
             → services (pure functions, Map-based Store)
```

- **无 OOP 类**（除错误类型外）：所有业务逻辑为纯函数
- **不可变数据**：始终返回新对象，不修改输入
- **Store = Map<string, Task>**：内存存储，通过函数参数注入（函数式 DI），可替换为数据库
- **统一响应信封**：`{ success, data, error }`，分页增加 `meta`

## Key Files

| 文件 | 职责 |
|------|------|
| `src/types/task.ts` | Task, TaskStatus, TaskPriority, API 信封类型, 错误类 |
| `src/validators/task.ts` | 输入校验, ALLOWED_TRANSITIONS 状态机 |
| `src/services/task.ts` | CRUD 纯函数, createTaskStore 工厂 |
| `src/routes/task.ts` | Express Router, 5个端点处理器 |
| `src/middleware/error.ts` | AppError → HTTP 状态码映射 |
| `src/app.ts` | Express 应用工厂 (createApp) |
| `src/index.ts` | 服务入口, 可配置 PORT |
| `src/__tests__/task.test.ts` | 集成测试 (node:test + fetch) |

## Coding Standards

- TypeScript 5.x strict mode, Node.js 20 LTS, Express.js 4.x
- 函数 < 50 行, 文件 < 500 行, 嵌套 < 4 层
- kebab-case 文件名, camelCase 函数, PascalCase 类型
- 显式标注所有函数参数和返回值类型
- 无 any, 无 mock 测试
- Task 状态机: todo↔in_progress→done, done→todo。禁止 todo→done 和 done→in_progress
