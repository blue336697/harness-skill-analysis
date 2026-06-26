# OpenSpec 实验过程记录

## 实验概述
- **Harness**: OpenSpec v1.2.0 (`@fission-ai/openspec`)
- **Schema**: `spec-driven`
- **需求**: TaskFlow API — 任务管理 REST API
- **耗时**: ~12分钟
- **结果**: 34/34任务完成, 7/7测试通过, 5端点curl验证通过

---

## 阶段0: 项目初始化与规范建立

### 步骤0.1: 创建项目骨架
- **命令**: `git init`, `npm init -y`, `openspec init --tools claude`
- **输入**: 空目录, 通用规范文档 `../common-specs.md`
- **输出**: `.claude/skills/` (4个技能) + `.claude/commands/opsx/` (4个命令) + `openspec/{changes/,specs/}`
- **Hook**: 无。OpenSpec CLI 不经过 Claude Code Hook 系统

### 步骤0.2: 建立项目规范 (config.yaml)
- **命令**: 手动创建 `openspec/config.yaml`
- **输入**: `../common-specs.md` 中的代码规范、设计规范、项目背景
- **机制**: `context` 字段在每次 `openspec instructions` 时自动注入; `rules` 字段定义每个 artifact 类型的约束

---

## 阶段1: 规划 — `/opsx:propose` 工作流

### 步骤1.1: `openspec new change "task-crud-api"`
- **输入**: 变更名称
- **输出**: `.openspec.yaml` (元数据: schema, 创建时间戳)

### 步骤1.2: `openspec status --json`
- **输出**: Artifact 依赖有向无环图(DAG)
  - `applyRequires: ["tasks"]` (tasks完成后即可开始实施)
  - proposal 就绪, design/specs 被 proposal 阻塞, tasks 被 design+specs 阻塞

### 步骤1.3: `openspec instructions proposal --json`
- **输出**: instruction(指令) + template(模板) + context(上下文)
- **产物**: `proposal.md` (为何做/改什么/能力/影响, ~40行)

### 步骤1.4: `openspec instructions design --json`
- **依赖**: proposal.md
- **产物**: `design.md` (背景/目标/决策/风险, ~55行, 5个技术决策)

### 步骤1.5: `openspec instructions specs --json`
- **依赖**: proposal.md
- **产物**: `specs/task-crud/spec.md` (5个需求 × 2-3个场景, ~75行)

### 步骤1.6: `openspec instructions tasks --json`
- **依赖**: design.md + specs
- **产物**: `tasks.md` (9组34个复选框任务, ~60行)

**中间产物**: proposal.md, design.md, specs/task-crud/spec.md, tasks.md

---

## 阶段2: 实施 — `/opsx:apply` 工作流

### 步骤2.1: `openspec instructions apply --json`
- **输出**: state:ready(状态:就绪), 34个任务, contextFiles 清单

### 步骤2.2: 逐任务编码 (任务1.1-7.2)
- **流程**: 读取contextFiles → 按序实施 → 标记[x]
- **产物**:
  - `src/types/task.ts` (75行, 9个类型/错误类)
  - `src/validators/task.ts` (69行, 3个校验函数+状态转换表)
  - `src/services/task.ts` (69行, 6个纯函数)
  - `src/routes/task.ts` (61行, 5个路由处理器)
  - `src/middleware/error.ts` (28行, 应用错误→HTTP映射)
  - `src/app.ts` (15行, Express工厂函数)
  - `src/index.ts` (10行, 服务入口)

### 步骤2.3: 测试 (任务8.1-8.7)
- **命令**: `pnpm test`
- **结果**: 7/7 通过 (0失败, ~1.5秒)
- **产物**: `src/__tests__/task.test.ts` (148行, node:test + fetch)

### 步骤2.4: curl 验证 (任务9.1-9.3)
- 5个端点全部验证通过, 无效状态转换→400, 删除后GET→404

---

## 阶段3: 完成
- `openspec status` → 4/4 artifacts 完成
- `/opsx:verify`, `/opsx:sync`, `/opsx:archive` (实验范围外未执行)

---

## 技能调用链总览
```
openspec init --tools claude
  → openspec new change "task-crud-api"
    → openspec status --json (查看依赖DAG)
      → openspec instructions proposal → proposal.md
      → openspec instructions design   → design.md
      → openspec instructions specs    → specs/task-crud/spec.md
      → openspec instructions tasks    → tasks.md (34个任务)
        → openspec instructions apply  → 开始实施
          → 手动编码34个任务 (任务1-9)
            → openspec status (完成确认)
```

## 核心特征

| 维度 | 特点 |
|------|------|
| 规范/代码关系 | 松耦合: .md artifacts 独立于源码 |
| 依赖管理 | CLI 自动计算 artifact 依赖DAG |
| AI引导 | instruction + template + context 三段式 |
| 上下文注入 | config.yaml context → 所有 instructions 自动携带 |
| 进度追踪 | tasks.md 复选框 + openspec status CLI |
| Hook系统 | 无独立Hook, 规则通过 config.yaml rules 表达 |
| 跨工具 | 30+ AI工具, 适配器模式 |
| 状态存储 | 纯文件系统 (Markdown + YAML) |

## 优缺点
**优点**: CLI驱动的结构化流程对AI友好(JSON API); Artifact DAG自动计算; config.yaml集中管理规范; 30+工具适配器
**缺点**: 无强制流程Hook(AI可跳过规划); 依赖CLI工具; 初始学习曲线
