# CLAUDE.md 层次化设计规范

> 利用 Claude Code 向上遍历加载 CLAUDE.md 的机制，实现"总→分"的层次化上下文架构。

## 一、设计哲学

### 核心问题

单一 CLAUDE.md 在大型项目中面临三个根本矛盾：

| 矛盾 | 描述 |
|---|---|
| **长度 vs 精度** | 一个文件覆盖全项目 → 要么太长被截断，要么太短不够精确 |
| **通用 vs 特定** | 项目级约定（如"用函数式编程"）和模块级约定（如"这个模块用 DDD"）混在一起 |
| **稳定 vs 变化** | 顶层稳定约定和快速变化的模块约定在同一文件 → 频繁修改破坏 prompt cache |

### 解决方案：层次化 CLAUDE.md

```
项目根目录/CLAUDE.md          ← 总（项目全局约定）
    │
    ├── src/CLAUDE.md          ← 分（后端通用约定）
    │   ├── src/auth/CLAUDE.md ← 分（认证模块约定）
    │   └── src/payment/CLAUDE.md
    │
    └── frontend/CLAUDE.md      ← 分（前端通用约定）
        ├── frontend/app/CLAUDE.md
        └── frontend/admin/CLAUDE.md
```

**工作原理**：当你工作于 `src/auth/` 时，Claude Code 自动加载：

```
~/.claude/CLAUDE.md        （用户级）
  → 项目根/CLAUDE.md        （总）
    → src/CLAUDE.md         （分：后端层）
      → src/auth/CLAUDE.md  （分：认证模块层）
```

从总到分，逐层叠加。Agent 获得一个完整的、从通用到特定的指令栈。

### 核心原则

1. **不重复父级内容**：子级只写增量约束，通过向上引用声明关系
2. **渐进式具体化**：每深入一层，约定更具体、更贴近该层代码
3. **作用域声明**：每层开头声明本层作用域，让 Agent 知道边界
4. **索引而非复制**：用文件路径引用父级/子级，而非复制内容

---

## 二、层次划分规则

### 2.1 划分深度与规模

| 项目规模 | 建议层次 | CLAUDE.md 总数 | 示例 |
|---|---|---|---|
| 小型（< 10 模块） | 1-2 层 | 2-3 | 根 + 按语言/框架分 |
| 中型（10-30 模块） | 2-3 层 | 5-10 | 根 + 语言层 + 领域层 |
| 大型（> 30 模块） | 3-4 层 | 10-20 | 根 + 语言层 + 领域层 + 组件层 |

### 2.2 什么应该成为一层

满足以下**任意两个条件**就应该拥有独立的 CLAUDE.md：

- [ ] 有独立的技术栈或语言
- [ ] 有不同于其他模块的代码约定
- [ ] 有自己的一套术语/领域语言
- [ ] 由不同的子团队维护
- [ ] 目录深度 ≥ 2 层（相对于最近的 CLAUDE.md）

---

## 三、各层模板

### 3.1 根 CLAUDE.md —— 项目总纲

位置：`<project-root>/CLAUDE.md`

```markdown
# <PROJECT_NAME>

## 项目概述
- 项目目标：
- 技术栈：
- 仓库结构总览：

## 索引：子级 CLAUDE.md

| 目录 | CLAUDE.md | 适用场景 |
|------|-----------|---------|
| src/ | [src/CLAUDE.md](src/CLAUDE.md) | 后端核心逻辑 |
| frontend/ | [frontend/CLAUDE.md](frontend/CLAUDE.md) | 前端页面 |
| docs/ | [docs/CLAUDE.md](docs/CLAUDE.md) | 文档编写 |

> Agent：当你工作在以上目录时，对应 CLAUDE.md 已被自动加载。
> 处理跨模块任务时，先读取所有相关子级 CLAUDE.md 再行动。

## 全局原则（所有模块通用）

### 代码风格
- 原则 1：...
- 原则 2：...

### 错误处理
- 始终显式抛出错误，禁止静默吞掉

### 文件组织
- 单文件不超过 500 行
- 按功能而非类型组织目录

## 架构决策（阶段一：初始化）

- ADR-001：选择了 X 而非 Y — 理由：...
- ADR-002：...

## 工具与环境
- Node >= 20，使用 pnpm
- 提交格式：`<type>: 描述`

## 工作流约定

### Agent 行为规则
- 每次修改代码后使用 code-review skill
- 开始新功能前使用 brainstorming → writing-plans

### Skills 策略
- 禁止跳过 Skill 检查。即使 1% 可能适用，也必须检查
```

### 3.2 语言/框架层 CLAUDE.md —— 技术栈约定

位置：`<project>/<技术目录>/CLAUDE.md`

```markdown
# <层名称> 约定

> 作用域：`<当前目录>/` 及其所有子目录
> 上级约定：[根 CLAUDE.md](../CLAUDE.md)
> 子级索引：<在此列出子级 CLAUDE.md，如有>

## 目录结构

<当前目录>/
├── <模块A>/   → <职责>
├── <模块B>/   → <职责>
└── <模块C>/   → <职责>

## 索引：子级 CLAUDE.md

| 目录 | CLAUDE.md | 适用场景 |
|------|-----------|---------|
| <模块A>/ | [<模块A>/CLAUDE.md](<模块A>/CLAUDE.md) | <描述> |

## 语言特定约定

### <语言> 代码风格
- <本层补充约定 1>
- <本层补充约定 2>

### 模块设计规则
- 每个模块通过统一入口导出（index.ts / __init__.py）
- 模块间仅通过接口通信，禁止直接引用内部实现

## 本层架构约束

### 依赖方向
- <描述本层的依赖规则>

### 数据流
- <描述本层的数据流规则>

## 本层工作流

### 修改本层代码的 Checklist
1. 确认不违反上级 CLAUDE.md 的全局原则
2. <本层特定检查项>
```

### 3.3 领域/模块层 CLAUDE.md —— 领域知识

位置：`<project>/<技术目录>/<模块>/CLAUDE.md`

```markdown
# <模块名> 约定

> 作用域：`<当前目录>/` 及其子目录
> 上级约定链：[根](../../CLAUDE.md) → [语言层](../CLAUDE.md)

## 领域模型

### 核心实体
- `Entity1`：<定义>
- `Entity2`：<定义>

### 实体关系
- `Entity1` → `Entity2`：<关系类型>

### 关键业务规则
1. <业务规则 1>
2. <业务规则 2>

## 模块结构

<当前目录>/
├── models/       → <职责>
├── services/     → <职责>
└── handlers/     → <职责>

## 模块特定约定

### 命名约定
- <本模块特定的命名规则>

### API 约定
- <本模块 API 规范>

## 已知约束与陷阱

- <陷阱 1>：<避免方法>
- <约束 1>：<原因>
```

---

## 四、索引机制设计

### 4.1 向上引用（子 → 父）

每个子级 CLAUDE.md 必须在顶部声明其上级约定链：

```markdown
> 作用域：<本目录>
> 上级约定：[根 CLAUDE.md](../../CLAUDE.md) → [中间层 CLAUDE.md](../CLAUDE.md)
```

**作用**：
- 告知 Agent：你正在一个层次化约定系统中，上级有更通用的规则
- 路径使用相对路径，确保在任意环境下可解析

### 4.2 向下索引（父 → 子）

父级 CLAUDE.md 列出子级的存在和用途：

```markdown
## 索引：子级 CLAUDE.md

| 目录 | CLAUDE.md | 适用场景 |
|------|-----------|---------|
| auth/ | [auth/CLAUDE.md](auth/CLAUDE.md) | 认证、权限、会话管理 |
| payment/ | [payment/CLAUDE.md](payment/CLAUDE.md) | 支付、账单、退款 |
```

**作用**：
- 告诉 Agent：这些子目录有独立约定
- 跨模块操作时，Agent 应根据这个"地图"去读取相关子级约定

### 4.3 跨模块协作规则

在根 CLAUDE.md 中设置跨模块工作规则：

```markdown
## 跨模块操作规则

当修改涉及多个模块时：
1. 识别受影响的所有模块
2. 根据各层索引找到对应的 CLAUDE.md
3. 用 Read 工具读取相关子级 CLAUDE.md（即使不在当前工作目录）
4. 确认修改不违反任何模块的特定约束

| 常见跨模块操作 | 需关注的 CLAUDE.md |
|-------------|-------------------|
| 修改认证 + 支付流程 | src/auth/CLAUDE.md + src/payment/CLAUDE.md |
| 新增 API 端点 | src/CLAUDE.md + 目标模块的 CLAUDE.md |
| 修改共享类型 | 根 CLAUDE.md + 所有受影响模块的 CLAUDE.md |
```

---

## 五、两阶段策略

### 5.1 阶段一：初始化 —— 重规划、重架构

根 CLAUDE.md **最大化**，包含所有架构决策和流程约束：

```markdown
## 架构决策记录（阶段一加载，阶段二可归档）

### 核心决策
- ADR-001：选择 X 而非 Y — 理由：...
- ADR-002：使用 Z 架构 — 理由：...

### 技术选型
| 决策点 | 选择 | 原因 |
|--------|------|------|
| 前端框架 | React 19 + TS | ... |
| 状态管理 | Zustand | ... |
| API 风格 | RESTful | ... |

## 当前阶段约束（INIT）

**HARD-GATE**：
- 不允许无 spec 文件直接写生产代码
- 不允许无架构评审引入新的外部依赖
- 不允许跳过 TDD 循环（Iron Law）
```

### 5.2 阶段二：敏捷迭代 —— 轻流程、快反馈

根 CLAUDE.md **缩减**，重流程内容迁移至 Skills：

```markdown
## 当前阶段：敏捷迭代（AGILE）

流程规则已由 Skills 管理，Agent 遵循以下策略：
- Bug 修复：/diagnose → /tdd → /code-review
- 小功能：/triage → /tdd → /code-review
- 重构：/improve-codebase-architecture

## 敏捷规则
- 小修改不需要完整 spec，但需 issue 追踪
- 引入外部依赖需团队确认
- 跨模块大范围修改需升级为专项任务

## 已知技术债务
- <债务 1>：<影响范围，帮助 Agent 避坑>
- <债务 2>：<影响范围>
```

### 5.3 SessionStart Hook 配合阶段切换

用 SessionStart Hook 注入当前阶段标记：

```bash
# session-start.sh
echo '{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<phase-marker>当前项目阶段：AGILE。严格遵守敏捷规则，不执行 INIT 阶段的重流程。</phase-marker>"
  }
}'
```

---

## 六、与 `.claude/rules/` 的分工

| 内容类型 | 放置位置 | 理由 |
|---------|---------|------|
| 全局原则（跨模块适用） | 根 CLAUDE.md | 始终加载，最稳定 |
| 详细规范（如 lint 配置细节） | .claude/rules/ | 拆分管理，避免根文件过大 |
| 语言特定规则 | 语言层 CLAUDE.md | 仅该语言目录下生效 |
| 模块领域知识 | 模块层 CLAUDE.md | 仅该模块目录下生效 |
| 可跨项目复用的规则 | ~/.claude/rules/ | 用户级，所有项目适用 |

### 加载链

```
~/.claude/CLAUDE.md          （用户级全局）
  → ~/.claude/rules/*.md     （用户级规则，所有项目）
    → 根 CLAUDE.md            （项目总纲）
      → .claude/rules/*.md   （项目级规则）
        → 父目录 CLAUDE.md（向上遍历）
          → 当前目录 CLAUDE.md
```

---

## 七、快速接入 Checklist

新项目按以下顺序建立 CLAUDE.md 层次体系：

- [ ] 1. 写根 CLAUDE.md：全局约定 + 目录结构 + 子级索引占位
- [ ] 2. 识别项目中的**自然边界**（语言/框架/业务领域）
- [ ] 3. 为每个边界创建子级 CLAUDE.md（可以先用简化版，后续补充）
- [ ] 4. 确保每层的向上引用和向下索引都已填写
- [ ] 5. 创建 `.claude/rules/` 放置交叉性规则
- [ ] 6. 在任意子目录启动 Claude Code，问 Agent "你加载了哪些项目约定？"，验证层次链完整
- [ ] 7. 新模块创建时同步创建其 CLAUDE.md
