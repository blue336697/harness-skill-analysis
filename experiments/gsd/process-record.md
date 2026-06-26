# GSD 实验过程记录

## 实验概述
- **Harness**: GSD Core v1.5.0-rc.3
- **工作流**: new-project → discuss → plan → execute → verify → ship (阶段管道)
- **结果**: 7/7测试通过, 6个planning中间文件

---

## 阶段0: Hook 系统 (17个Hook)

GSD 拥有最复杂的 Hook 系统:

**SessionStart 启动时** (3个): `gsd-ensure-canonical-path`(路径规范化), `gsd-check-update`(更新检查), `gsd-statusline`(状态行)

**PreToolUse 工具使用前** (3个, 仅GSD有):
- `gsd-prompt-guard` (Write/Edit时): 写入前校验
- `gsd-read-guard` (Write/Edit时): 确保已读取目标文件
- `gsd-worktree-path-guard` (Write/Edit时): 工作树路径安全校验

**PostToolUse 工具使用后** (2个):
- `gsd-context-monitor` (Bash/Edit/Write/Agent/Task后): 上下文占用监控 (60%警告, 70%临界)
- `gsd-read-injection-scanner` (Read后): 注入扫描

**其他**: SubagentStop, Stop, PreCompact, FileChanged

**关键**: GSD 是唯一对 PreToolUse 做防护的 Harness，阻止 AI 跳过工作流直接编码。

---

## 阶段1: /gsd-new-project — 项目初始化

**技能来源**: `repos/gsd/commands/gsd/new-project.md`
**模板来源**: `gsd-core/templates/project.md`, `requirements.md`, `state.md`

**输入**: 项目名称(TaskFlow API)、技术栈、架构偏好

**中间产物**:
| 文件 | 内容 | 模板 |
|------|------|------|
| `.planning/PROJECT.md` | 项目上下文(是什么/核心价值/背景/约束/决策) | `templates/project.md` |
| `.planning/config.json` | 工作流偏好(自动/TDD/代码审查/研究) | — |
| `.planning/REQUIREMENTS.md` | 6个功能需求(FR-1~FR-6) | `templates/requirements.md` |
| `.planning/ROADMAP.md` | 3个里程碑, M1=Task CRUD | — |
| `.planning/STATE.md` | 进度追踪(状态/位置/指标/连续性) | `templates/state.md` |

---

## 阶段2: /gsd-discuss-phase — 捕获实现决策

**技能来源**: `repos/gsd/commands/gsd/discuss-phase.md`
**模板来源**: `gsd-core/templates/context.md`

**输入**: PROJECT.md, REQUIREMENTS.md, ROADMAP.md

**中间产物**:
| 文件 | 关键内容 |
|------|---------|
| `.planning/phases/01-task-crud-api/01-CONTEXT.md` | 阶段边界, 22个实现决策(D-01~D-22), 规范引用, 推迟的想法 |

**决策分类**: 架构(D-01~03), 存储(D-04~05), 数据模型(D-06~08), API(D-09~11), 校验(D-12~15), 错误(D-16~19), 测试(D-20~22)

**下游消费者**: gsd-phase-researcher(读决策聚焦研究), gsd-planner(读决策+规范引用创建任务)

---

## 阶段3: /gsd-plan-phase — 规划 (3子代理链)

**子代理链**: gsd-phase-researcher → gsd-planner → gsd-plan-checker (最多3次修订)

**Fresh Context 机制**: 每个子代理获得全新 200K token 上下文窗口，从根本上消除上下文腐烂。

### 与 OpenSpec/Superpowers 规划对比
| 维度 | GSD | OpenSpec | Superpowers |
|------|-----|----------|-------------|
| 结构 | 依赖波(Dependency Waves) | 9组34复选框 | 6组~30微步骤 |
| 代码 | 任务描述 | 无代码 | 每步完整代码 |
| 验证 | plan-checker (最多3次) | 无验证 | 自查 |
| 上下文 | 200K 全新/每代理 | 共享上下文 | 共享上下文 |

---

## 阶段4: /gsd-execute-phase — 并行Wave执行

```
计划 → 依赖分析 → Wave编组
  Wave 1: gsd-executor-1 ∥ gsd-executor-2 (并行)
  → gsd-integration-checker (集成检查)
  Wave 2: gsd-executor-3 (依赖Wave 1)
  → gsd-integration-checker
```

**编排器不执行**: 只协调子代理，不亲自编码
**检查点协议**: 防止超时，支持断点续传

---

## 阶段5-6: /gsd-verify-work → /gsd-ship

**验证**: 对话式 UAT — "这是应该发生的。实际情况是否匹配？" (是/下一步/空 → 通过)
**发布**: 前置检查 → 可选代码审查 → 创建GitHub PR → 更新STATE.md

---

## GSD 中间文件总览

```
.planning/
├── PROJECT.md              ← /gsd-new-project
├── config.json             ← /gsd-new-project
├── REQUIREMENTS.md         ← /gsd-new-project
├── ROADMAP.md              ← /gsd-new-project
├── STATE.md                ← /gsd-new-project
└── phases/01-task-crud-api/
    └── 01-CONTEXT.md       ← /gsd-discuss-phase (22个决策)
```

## Hook 触发表

| Hook | 触发时机 | 功能 |
|------|---------|------|
| gsd-ensure-canonical-path | SessionStart | 路径规范化 |
| gsd-check-update | SessionStart | GSD更新检查 |
| gsd-statusline | SessionStart | 状态行显示 |
| gsd-prompt-guard | PreToolUse(Write/Edit) | 写入前防护 |
| gsd-read-guard | PreToolUse(Write/Edit) | 确保已读取 |
| gsd-worktree-path-guard | PreToolUse(Write/Edit) | 工作树路径安全 |
| gsd-context-monitor | PostToolUse(Bash/Edit/Write/Agent) | 上下文占用监控(60%警告) |
| gsd-read-injection-scanner | PostToolUse(Read) | 注入扫描 |

## 独有优势
- **最强Hook系统**: PreToolUse防护 + context-monitor + 注入扫描
- **Fresh Context**: 每个子代理全新200K上下文，消除上下文腐烂
- **Parallel Waves**: 依赖分析自动并行化
- **对话式UAT**: 创新的验证方式

## 代价
- **复杂度最高**: 68命令 + 33Agent + 17Hook
- **子代理开销**: 每个子代理新建上下文窗口
- **学习曲线**: 需要理解阶段管道概念
