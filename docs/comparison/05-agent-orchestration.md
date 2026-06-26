# 多代理编排对比

> 四个项目如何管理 sub-agent：调度策略、上下文隔离、并行执行。

## 一、Superpowers：逐任务隔离 + 两级审查

### 1.1 执行模型

**出处**：`repos/superpowers/skills/subagent-driven-development/SKILL.md`

```
对计划中的每个任务：
  1. 派发 Implementer 子代理（git worktree 隔离）
  2. 派发 Spec Review 子代理
  3. 派发 Code Quality Review 子代理
  4. 判断：DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
  5. 继续下一个任务
```

### 1.2 Worktree 隔离

**出处**：`repos/superpowers/skills/using-git-worktrees/SKILL.md`

每个 Implementer 在独立 git worktree 中执行。物理文件隔离，避免并发冲突。

### 1.3 子代理豁免

**出处**：`repos/superpowers/skills/using-superpowers/SKILL.md` L6-8

```markdown
<SUBAGENT-STOP>
如果你作为子代理被派发执行特定任务，跳过本 Skill。
</SUBAGENT-STOP>
```

> 原文：If you were dispatched as a subagent to execute a specific task, skip this skill.

子代理不加载 using-superpowers 引导，避免上下文浪费。

### 1.4 并行派发

**出处**：`repos/superpowers/skills/dispatching-parallel-agents/SKILL.md`

无依赖任务可同时派发多个 Implementer 并行执行。

---

## 二、GSD：波分析 + Fresh Context

### 2.1 波分析

```
任务列表 → 依赖分析 → Wave 分组
  第1波: [A, B]（无依赖，并行）← 每个全新 200K 上下文
  第2波: [C, D]（依赖第1波）   ← 每个全新 200K 上下文
  第3波: [E]（依赖第2波）       ← 全新 200K 上下文

波内并行，波间串行。
编排器使用 xhigh effort，执行器使用 low effort。
```

### 2.2 并发控制

**出处**：`repos/gsd/CONTEXT.md`

max(min(16, cpu_cores - 2))，防止过度占用系统资源。

---

## 三、OpenSpec：无 Sub-agent

主对话 Agent + CLI 工具驱动全部操作：

```
主 Agent → openspec instructions --json → 执行当前 Artifact → validate → 下一 Artifact
```

无上下文隔离（因为没有子代理）。

---

## 四、Matt Pocock：只读搜索 Agent

```
需要并行读取多个不相关文件？
  → 是：派发 Explore 子代理（Haiku 模型，只读）
  → 否：主 Agent 直接操作
```

子代理不写代码，仅搜索和读取。

---

## 五、对比总结

| 维度 | Superpowers | OpenSpec | GSD | Matt Pocock |
|------|------------|----------|-----|-------------|
| **用途** | 执行 + 审查 | 不使用 | 波内并行执行 | 仅搜索 |
| **调度** | 逐任务串行/并行 | CLI 驱动 | **波分析 DAG** | 用户决定 |
| **隔离** | Git worktree | 无 | **全新 200K 上下文** | 无 |
| **并发** | 手动派发 | 无 | min(16, cores-2) | 手动 |
| **豁免** | `<SUBAGENT-STOP>` | N/A | hooks 管理 | N/A |

### 核心差异

- **Superpowers**：Sub-agent = 质量单元。隔离 + 审查保证每个任务交付质量
- **GSD**：Sub-agent = 并行单元。波分析最大化利用并发能力
- **OpenSpec**：不需要 sub-agent。CLI 工具 + 主 Agent 足够
- **Matt Pocock**：Sub-agent = 只读搜索辅助。不改代码
