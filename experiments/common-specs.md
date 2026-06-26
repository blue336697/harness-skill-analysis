# 通用规范 — 四个实验共用

## 1. 项目背景

### 公司
- **名称**: TaskFlow
- **阶段**: 种子轮初创公司
- **团队**: 2 名全栈开发者
- **目标**: 构建轻量级项目管理 SaaS 工具

### 当前状态
- 项目从零开始，无任何现有代码
- 需要交付 MVP 版本给内部 Alpha 测试用户
- 第一优先级：Task（任务）实体的 CRUD REST API

### MVP 目标
- 提供 Task 管理的核心 API 端点
- 支持任务的创建、查询、更新、删除
- 支持按状态过滤任务
- 为后续前端开发提供稳定的 API 契约

---

## 2. 功能需求

### FR-1: 创建任务
- **输入**: 任务标题（必填）、描述（可选）、优先级（可选，默认 `medium`）
- **输出**: 创建的任务对象，包含唯一 ID、创建时间、更新时间
- **规则**: 标题不能为空，长度 1-200 字符

### FR-2: 查询任务列表
- **输入**: 可选的 `status` 过滤参数
- **输出**: 任务列表（数组）
- **规则**: 支持分页参数 `offset` 和 `limit`（默认 20，最大 100）

### FR-3: 查询单个任务
- **输入**: 任务 ID
- **输出**: 任务详情对象
- **规则**: 任务不存在时返回 404

### FR-4: 更新任务
- **输入**: 任务 ID + 要更新的字段（标题、描述、优先级、状态）
- **输出**: 更新后的任务对象
- **规则**: 至少更新一个字段；状态变更需符合状态机规则

### FR-5: 删除任务
- **输入**: 任务 ID
- **输出**: 204 No Content
- **规则**: 任务不存在时返回 404

### FR-6: 任务状态机
- 状态流转: `todo` → `in_progress` → `done`
- 允许: `todo` ↔ `in_progress`, `in_progress` → `done`, `done` → `todo`（重新打开）
- 禁止: `todo` → `done`（跳过 in_progress）、`done` → `in_progress`

---

## 3. 数据模型

```typescript
type TaskStatus = 'todo' | 'in_progress' | 'done';

type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: string;            // UUID v4
  title: string;          // 1-200 字符
  description: string;    // 可选，默认空字符串
  status: TaskStatus;     // 默认 'todo'
  priority: TaskPriority; // 默认 'medium'
  createdAt: string;      // ISO 8601 格式
  updatedAt: string;      // ISO 8601 格式
}
```

---

## 4. API 设计规范

### 基础信息
- **协议**: HTTP/1.1
- **Base Path**: `/api/v1`
- **Content-Type**: `application/json`
- **字符编码**: UTF-8

### 端点定义

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/tasks` | 创建任务 |
| GET | `/api/v1/tasks` | 查询任务列表 |
| GET | `/api/v1/tasks/:id` | 查询单个任务 |
| PATCH | `/api/v1/tasks/:id` | 更新任务 |
| DELETE | `/api/v1/tasks/:id` | 删除任务 |

### 响应格式

统一响应信封：

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    offset: number;
    limit: number;
  };
}
```

### 错误码

| HTTP 状态码 | 场景 |
|------------|------|
| 400 | 参数校验失败（如空标题、无效状态转换） |
| 404 | 任务不存在 |
| 500 | 服务器内部错误 |

---

## 5. 代码规范

### 语言和工具
- **语言**: TypeScript 5.x，strict mode
- **运行时**: Node.js 20 LTS
- **Web 框架**: Express.js 4.x
- **测试框架**: Node.js 内置 `node:test` + `node:assert`
- **包管理**: pnpm

### 架构原则
- **函数式优先**: 纯函数为主，OOP 类仅用于外部连接器
- **不可变数据**: 始终返回新对象，不修改输入参数
- **DRY**: 抽取公共逻辑
- **KISS**: 避免过度设计
- **YAGNI**: 只实现当前需求

### 文件组织
- 单文件 200-400 行，最大 500 行
- 单函数 < 50 行
- 嵌套深度 < 4 层
- 按功能/领域组织目录，不按类型

### 类型要求
- 所有函数参数、返回值、变量必须标注类型
- 禁止使用 `any` 和 `unknown`
- 禁止泛型类型滥用
- 复杂数据结构必须定义规范的类型/接口

### 命名规范
- 文件名: kebab-case（如 `task-service.ts`）
- 函数名: camelCase（如 `createTask`）
- 类型名: PascalCase（如 `Task`, `CreateTaskInput`）
- 常量: UPPER_SNAKE_CASE（如 `MAX_TITLE_LENGTH`）

### 错误处理
- 显式抛出错误，不静默忽略
- 使用具体的错误类型
- 错误消息包含调试上下文
- 不添加回退逻辑

### 目录结构约定
```
src/
├── index.ts
├── app.ts
├── types/
│   └── task.ts
├── validators/
│   └── task.ts
├── services/
│   └── task.ts
├── routes/
│   └── task.ts
├── middleware/
│   └── error.ts
└── __tests__/
    └── task.test.ts
```

---

## 6. 技术栈详情

```json
{
  "name": "taskflow-api",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "node --import tsx --test src/**/*.test.ts"
  },
  "dependencies": {
    "express": "^4.21.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/uuid": "^10.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}
```

---

## 7. 实验记录格式

每个实验的 `process-record.md` 按以下格式记录：

### 每步记录内容
1. **步骤编号和名称**
2. **使用的 Skill/命令**: 完整名称和调用方式
3. **输入**: 传入的上下文、参数、文件引用
4. **输出**: Skill 的响应内容和决策
5. **中间产物文件**: 产生的文件列表和关键内容摘要
6. **Hook 触发记录**: 哪些 Hook 被触发，做了什么检查/注入
7. **上下文快照**: 该阶段结束时系统中的文件列表和关键文件内容摘要
8. **耗时观察**: 该步骤的人工/AI 交互轮次
