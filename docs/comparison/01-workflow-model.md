# 工作流模型对比

> 四个项目如何定义"从需求到完成"的开发流程。每个结论均引用原始出处。

## 一、Superpowers：方法论驱动的线性管道

### 1.1 设计理念

Agent 拿到需求后不能直接写代码，必须先经过结构化推理→设计→计划→执行。

### 1.2 HARD-GATE 机制

**出处**：`repos/superpowers/skills/brainstorming/SKILL.md` L12-14

```markdown
<HARD-GATE>
在向用户展示设计方案并**获得批准**之前，禁止调用任何实现类 Skill、编写任何代码、
搭建任何项目框架、或执行任何实现操作。此规则适用于所有项目，无论看起来多简单。
</HARD-GATE>
```

> 原文：Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.

**论点**：Superpowers 是唯一用 XML 标签定义"硬关口"的框架。这不是建议——是 Agent 的硬约束。

### 1.3 9 步 Checklist

**出处**：`repos/superpowers/skills/brainstorming/SKILL.md` L24-32

```
1. 探索项目上下文 — 检查文件、文档、最近的提交记录
2. 提供视觉辅助（如果涉及视觉问题）
3. 逐次提问 — 一次只问一个问题，了解目的/约束/成功标准
4. 提出 2-3 个方案 — 包含权衡分析和推荐
5. 呈现设计方案 — 逐节展示，每个节点需获得用户批准
6. 编写设计文档 → docs/superpowers/specs/YYYY-MM-DD-<主题>-design.md
7. 设计自审 — 快速检查占位符、矛盾、模糊之处
8. 用户审阅书面 spec — 在继续之前请用户审阅 spec 文件
9. 转交实施 — 调用 writing-plans skill
```

> 原文：1. Explore project context — check files, docs, recent commits. 2. Offer visual companion. 3. Ask clarifying questions — one at a time. 4. Propose 2-3 approaches. 5. Present design. 6. Write design doc. 7. Spec self-review. 8. User reviews written spec. 9. Transition to implementation.

**论点**：一次只问一个问题（第3步）是刻意设计——防止信息过载，保证每个回答都被充分考虑。第5步和第8步是阻塞点。

### 1.4 流程转换约束

**出处**：`repos/superpowers/skills/brainstorming/SKILL.md` L66

```markdown
终态是调用 writing-plans。禁止调用 frontend-design、mcp-builder 或其他任何
实现类 Skill。brainstorming 之后唯一允许调用的 Skill 是 writing-plans。
```

> 原文：The terminal state is invoking writing-plans. Do NOT invoke frontend-design, mcp-builder, or any other implementation skill. The ONLY skill you invoke after brainstorming is writing-plans.

**论点**：brainstorming 的出口唯一——writing-plans。显式禁止跳过计划阶段直接实现。

### 1.5 反模式预驳

**出处**：`repos/superpowers/skills/brainstorming/SKILL.md` L16-18

```markdown
## 反模式："这太简单了不需要设计"

每个项目都必须走完这个流程。待办清单、单函数工具、配置变更——统统都要。
"简单"项目恰恰是未经审视的假设造成最多浪费的地方。
```

> 原文：Every project goes through this process. A todo list, a single-function utility, a config change — all of them. "Simple" projects are where unexamined assumptions cause the most wasted work.

**论点**：这是针对 Agent 最常见合理化借口的预先驳斥——"简单项目也需要设计"被显式写进规则。

---

## 二、OpenSpec：Artifact DAG 驱动的状态机

### 2.1 设计理念

不定义"做什么"的流程，而是定义"产生什么"的**产物依赖图**。工作流由产物的拓扑顺序自然驱动。

### 2.2 Artifact 数据模型

**出处**：`repos/openspec/src/core/artifact-graph/types.ts` L4-11

```typescript
export const ArtifactSchema = z.object({
  id: z.string().min(1),                        // 产物唯一标识
  generates: z.string().min(1),                 // 产出的文件
  description: z.string(),                      // 描述
  template: z.string().min(1),                  // 模板文件
  instruction: z.string().optional(),           // AI 指令
  requires: z.array(z.string()).default([]),   // 依赖的前置产物
});
```

> 原文注释：id — Artifact ID, generates — generated file, description — description, template — template file, instruction — AI instruction (optional), requires — prerequisite artifacts.

**论点**：每个 Artifact 声明 `requires`（依赖什么）+ `generates`（产出什么），系统据此自动计算构建顺序——不是人类手动排的流程。

### 2.3 Kahn 拓扑排序

**出处**：`repos/openspec/src/core/artifact-graph/graph.ts` L68-80

```typescript
/**
 * 使用 Kahn 算法计算拓扑构建顺序。
 * 返回产物 ID 数组，按应构建的顺序排列。
 */
getBuildOrder(): string[] {
    const inDegree = new Map<string, number>();
    const dependents = new Map<string, string[]>();
    // 初始化所有产物的入度
    for (const artifact of this.artifacts.values()) {
      inDegree.set(artifact.id, artifact.requires.length);
    }
    // Kahn 算法：入度为 0 的节点先构建，移除节点后减少后继入度
    // ...
}
```

> 原文注释：Computes the topological build order using Kahn's algorithm. Returns artifact IDs in the order they should be built.

**论点**：OpenSpec 用图论算法保证产物按正确顺序生成。这不是建议——是算法强制执行。

### 2.4 文件系统即状态

**出处**：`repos/openspec/src/core/artifact-graph/state.ts` L14-29

```typescript
/**
 * 通过检查产物文件在变更目录中是否存在，检测哪些产物已完成。
 */
export function detectCompleted(graph: ArtifactGraph, changeDir: string): CompletedSet {
  const completed = new Set<string>();
  for (const artifact of graph.getAllArtifacts()) {
    if (isArtifactComplete(artifact.generates, changeDir)) {
      completed.add(artifact.id);
    }
  }
  return completed;
}
```

> 原文注释：Detects which artifacts are completed by checking file existence in the change directory.

**论点**：状态完全由文件系统决定——产物文件存在即完成。零运行时状态，不依赖外部数据库。

### 2.5 Schema.yaml 配置示例

```yaml
# 功能开发工作流定义
name: feature-development
version: 1
description: 标准功能开发工作流

artifacts:
  - id: proposal            # 提案
    generates: proposal.md
    description: 功能提案文档
    template: templates/proposal.md
    instruction: 定义功能范围和验收标准

  - id: specs               # 规格
    generates: specs/*.md
    description: 详细规格说明
    template: templates/spec.md
    requires:
      - proposal            # 依赖提案完成

  - id: design              # 设计
    generates: design.md
    description: 技术设计文档
    template: templates/design.md
    requires:
      - proposal            # 依赖提案完成

  - id: tasks               # 任务
    generates: tasks.md
    description: 实施任务清单
    template: templates/tasks.md
    requires:
      - specs               # 依赖规格和设计都完成
      - design

apply:                       # 执行阶段
  requires:
    - tasks                  # 依赖任务清单完成
  tracks: tasks.md           # 进度追踪文件
  instruction: 逐任务实施，在 tasks.md 中标记完成状态
```

生成的 DAG：
```
proposal（提案，根节点）
    ├── specs（规格）──┐
    └── design（设计）──┤
                        ├── tasks（任务）→ APPLY（执行）
```

**论点**：proposal → specs + design → tasks → apply 的依赖链不是"约定"，而是通过 `requires` 字段声明的可执行约束。

---

## 三、GSD：五阶段状态机 + 状态外化

### 3.1 五阶段循环

**出处**：`repos/gsd/README.md` 和 `repos/gsd/CONTEXT.md`

```
Discuss（讨论）→ Plan（计划）→ Execute（执行）→ Verify（验证）→ Ship（交付）
```

**出处**：`repos/gsd/CONTEXT.md` L1-8（格式说明）

```markdown
# 上下文
> **格式**：本文档支持机器 grep。每个操作事实是单行断言
> （`CLASS.subkey=value`）。Agent 简报按 ID 逐字引用断言——禁止改写本文档内容。
> 新的知识以断言形式添加；时间顺序的记录放在底部的会话日志中。
```

> 原文：Format: this document is machine-greppable. Each operational fact is a single-line predicate. Agent briefs cite predicates by ID verbatim — never paraphrase from this file. New learnings go in as predicates; chronological prose belongs in the session log.

### 3.2 STATE.md 状态外化

**出处**：`repos/gsd/CONTEXT.md` 的 STATE.md Document Module

```yaml
---
gsd_state_version: 1        # 状态版本
milestone: "v1.0"           # 里程碑
status: executing            # 当前状态：执行中
active_phase: execute        # 活跃阶段：执行阶段
next_action: "运行第 3 波（共 5 波）：src/auth 测试"
---
```

**状态转换**：
```
discussing → planning → executing → verifying → completed
（讨论中）  （计划中）  （执行中）  （验证中）  （已完成）
```

**论点**：GSD 的核心洞察——所有状态必须在文件系统中，不依赖 Agent 的会话记忆。这使得任意时刻重启会话都能恢复工作。

### 3.3 波分析（Wave Analysis）

GSD 不简单地分配任务，而是通过依赖分析计算执行波：

```
Tasks → 依赖分析 → Wave 分组
  第1波: [任务A, 任务B]      ← 无依赖，可并行
  第2波: [任务C, 任务D]      ← 依赖第1波
  第3波: [任务E]              ← 依赖第2波

波内并行执行，波间严格串行，每个执行器获得全新上下文
```

**论点**：波分析结合了 OpenSpec 的 DAG 思想（依赖排序）和 Superpowers 的 sub-agent 思想（并行执行），但增加了"fresh context"作为显式设计目标。

### 3.4 原子锁机制

**出处**：`repos/gsd/CONTEXT.md` 的 Planning Workspace Module

```
原子锁：使用 O_EXCL 创建锁文件，10 秒后自动过期清理
```

> 原文：Atomic lock: O_EXCL creation, 10-second expiry auto-cleanup.

**论点**：文件系统锁防止多个 Agent 同时操作同一个 STATE.md，解决了多人/多 Agent 协作时的竞态问题。

---

## 四、Matt Pocock：离散技能的自由组合

### 4.1 设计理念

不定义"工作流"。每个 Skill 是独立的可组合单元。顺序由用户决定。

### 4.2 Skill 分类

**出处**：`repos/mattpocock/CLAUDE.md` L1-8

```markdown
Skills 按功能分桶存放在 `skills/` 目录下：

- engineering/   — 日常编码工作
- productivity/  — 日常非编码工作流工具
- misc/          — 保留但较少使用
- personal/      — 个人专用，不对外推广
- in-progress/   — 尚未完成的草稿
- deprecated/    — 已废弃不再使用
```

> 原文：Skills are organized into bucket folders: engineering/ — daily code work, productivity/ — daily non-code workflow tools, misc/ — kept around but rarely used, personal/ — tied to own setup, in-progress/ — drafts, deprecated/ — no longer used.

**论点**：这些是**分类**（按用途），不是**阶段**（按时间）。Agent 根据任务自由组合。

### 4.3 diagnose 的六步循环（最接近"流程"的设计）

**出处**：`repos/mattpocock/skills/engineering/diagnose/SKILL.md` L8-52

```
阶段1 — 构建反馈循环（核心）
阶段2 — 复现
阶段3 — 假设
阶段4 — 仪器化
阶段5 — 修复 + 回归测试
阶段6 — 清理 + 事后分析
```

核心原则（L14）：

```markdown
**这就是整个 Skill 的精髓。** 其余都是机械操作。如果你有一个快速、确定性、
Agent 可运行的通过/失败信号，你就能找到根因——二分法、假设检验和仪器化
都只是消费那个信号的手段。
```

> 原文：This is the skill. Everything else is mechanical. If you have a fast, deterministic, agent-runnable pass/fail signal for the bug, you will find the cause — bisection, hypothesis-testing, and instrumentation all just consume that signal.

**论点**：即使是 diagnose 这个最"流程化"的 Skill，也没有 HARD-GATE。Phase 之间转换靠 Agent 判断，不被强制。

### 4.4 自由组合模式

```
Bug 修复:   diagnose → tdd → code-review
小功能:     triage → grill-me → tdd → code-review
重构:      improve-codebase-architecture → code-review
PRD 编写:  to-prd → to-issues
```

每个链是**建议的**，不是**强制的**。

---

## 五、对比总结

| 维度 | Superpowers | OpenSpec | GSD | Matt Pocock |
|------|------------|----------|-----|-------------|
| **流程模型** | 线性管道（brainstorming→writing-plans→subagent-dev） | DAG 状态机（Kahn 算法驱动） | 五阶段状态机（讨论→计划→执行→验证→交付） | 离散技能自由组合 |
| **强制方式** | `<HARD-GATE>` XML 标签 | `requires` 依赖链 + 文件存在检测 | STATE.md 门控 + 原子锁 | 无强制 |
| **状态存储** | 用户批准即状态 | 文件系统（产物存在 = 完成） | STATE.md + .planning/ 文件 | Issue Tracker |
| **跳过流程** | HARD-GATE 禁止 | 依赖不满足 → 产物不可构建 | 状态机拒绝非法转换 | 用户自由 |
| **反模式防御** | 预驳合理化借口表 | Schema 验证 + strict 模式 | 对抗性验证 + plan-checker | grill-me 追问 |
| **流程唯一出口** | brainstorming → writing-plans（唯一） | apply.requires → 产物全部完成 | 阶段严格顺序 | 无 |

### 设计哲学差异

- **Superpowers**：假设 Agent 会找借口跳过流程 → HARD-GATE 堵死所有借口
- **OpenSpec**：假设流程正确性由依赖保证 → 图算法自动计算顺序
- **GSD**：假设长周期项目需要断点恢复 → 所有状态外化到文件系统
- **Matt Pocock**：假设 Agent 能自主判断 → 提供工具不强制使用
