# Skill/命令设计对比

> 四个项目如何设计、组织、触发 Skill。每个结论引用原始出处。

## 一、Superpowers：流程型 Skill + SessionStart 自引导

### 1.1 触发语言：命令式

**出处**：`repos/superpowers/skills/brainstorming/SKILL.md` L1-4

```yaml
---
name: brainstorming
description: "在进行任何创造性工作（创建功能、构建组件、添加功能、修改行为）之前，
  你必须使用本 Skill。在实现之前探索用户意图、需求和设计方案。"
---
```

> 原文：You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.

**论点**：description 使用"MUST"命令式语言。与 Matt Pocock 的温和关键词式触发形成对比。

### 1.2 强制自引导：SessionStart 注入

**出处**：`repos/superpowers/skills/using-superpowers/SKILL.md` L10-16

```markdown
<极其重要>
如果你认为某个 Skill 有哪怕 1% 的可能性适用，你**绝对必须**调用该 Skill。
如果一个 Skill 适用于你的任务，你**没有选择**。你**必须使用它**。
这不是可协商的。这不是可选的。你不能找理由绕过。
</极其重要>
```

> 原文：If you think there is even a 1% chance a skill might apply, you ABSOLUTELY MUST invoke the skill. IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT. This is not negotiable. This is not optional. You cannot rationalize your way out of this.

SessionStart Hook 配置（`repos/superpowers/hooks/hooks.json`）：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" session-start",
            "async": false
          }
        ]
      }
    ]
  }
}
```

注入脚本将 `using-superpowers/SKILL.md` 全文通过 `additionalContext` 注入每个会话。

### 1.3 理性化防御表

**出处**：`repos/superpowers/skills/using-superpowers/SKILL.md` L82-95

```markdown
| 你的想法 | 事实 |
|---------|------|
| "这只是一个简单的问题" | 问题就是任务。检查 Skill。 |
| "我需要先了解更多上下文" | Skill 检查在澄清问题**之前**。 |
| "让我先探索代码库" | Skill 告诉你**怎么**探索。先检查。 |
| "我记得这个 Skill" | Skill 会更新。读取当前版本。 |
| "这个 Skill 太重了" | 简单的事会变复杂。使用它。 |
```

> 原文：Thought vs Reality table — "This is just a simple question" → "Questions are tasks. Check for skills." etc.

**论点**：12 行表精确覆盖 Agent 最常见的合理化借口。这不是一般提示——是心理学设计。

### 1.4 14 个 Skill 全景

```
using-superpowers/          ← 引导入口
brainstorming/               ← 需求→设计
writing-plans/               ← 设计→计划
subagent-driven-development/ ← 核心执行
test-driven-development/     ← Iron Law TDD
requesting-code-review/      ← 请求审查
receiving-code-review/       ← 接收审查
executing-plans/             ← 计划执行
dispatching-parallel-agents/ ← 并行派发
using-git-worktrees/         ← Worktree 管理
verification-before-completion/ ← 完成验证
systematic-debugging/        ← 系统调试
finishing-a-development-branch/ ← 分支收尾
writing-skills/              ← Skill 元开发
```

---

## 二、OpenSpec：编译时生成 + CLI JSON

### 2.1 Skill 由 TypeScript 模板编译生成

OpenSpec 的 Skill 不手写。`openspec init` 读取 `schema.yaml`，通过模板系统生成所有 SKILL.md。

**出处**：`repos/openspec/src/core/command-generation/generator.ts`
**出处**：`repos/openspec/src/core/command-generation/adapters/claude.ts`（Claude Code 适配器）

### 2.2 运行时 CLI 查询

```bash
openspec instructions --json
# → 结构化返回当前 Artifact 状态和下一步指令
```

Agent 通过 CLI 获取动态状态，避免将大量状态信息塞进 LLM 上下文。

### 2.3 Profile 组织

```yaml
core:       [propose, explore, apply, sync, archive]    # 核心模式
extended:   [propose, explore, apply, sync, archive, validate, task]  # 扩展模式
minimal:    [propose, apply]                            # 最小模式
```

### 2.4 Schema.yaml → Artifact DAG → Skill 自动生成

```yaml
artifacts:
  - id: proposal         # 提案
    generates: proposal.md
    template: templates/proposal.md
    requires: []
  - id: tasks            # 任务
    generates: tasks.md
    requires: [specs, design]   # 依赖规格和设计
```

**论点**：OpenSpec 的 Skill 不是"写出来的"，是"编译出来的"。一致性由模板保证。

---

## 三、GSD：两级路由 + Capability 描述符

### 3.1 路由削减 92%

```
69 个命令 → 6 个路由器（gsd-ns-*）
Token 成本：约 2,150 → 约 120 tokens
```

Agent 只看到 6 个路由器，看不到背后的 69 个命令细节。

### 3.2 Capability 描述符

GSD 用 JSON 描述符声明能力：

```json
{
  "name": "gsd-execute-phase",
  "category": "execute",                              // 分类：执行
  "dependencies": ["STATE.md", "PLAN.md"],            // 依赖文件
  "outputs": ["已完成任务", "更新后的 STATE.md"],       // 输出
  "agent_type": "executor"                            // Agent 类型
}
```

### 3.3 安装生成的布局

**出处**：`repos/gsd/CONTEXT.md` Installer Module

> 七种非递归 Skill 加载器的运行时使用嵌套路由器布局：6 个 `gsd-ns-*` 路由 bundle 作为顶层 Skill 发出，具体 Skill 嵌套在 `<router>/skills/<name>/SKILL.md`。

> 原文：Seven runtimes with non-recursive skill loaders use a nested router layout: 6 gsd-ns-* router bundles emitted as top-level skills, with concrete skills nested at <router>/skills/<name>/SKILL.md.

---

## 四、Matt Pocock：轻量单文件 Skill

### 4.1 格式与约束

**出处**：`repos/mattpocock/skills/engineering/diagnose/SKILL.md` L1-4

```yaml
---
name: diagnose
description: 用于顽固 Bug 和性能回归的纪律性诊断循环。复现→最小化→假设→仪器化→
  修复→回归测试。当用户说"诊断这个"/"调试这个"，报告了一个 Bug，说某功能坏了/
  抛异常/失败，或描述了性能回归时使用。
---
```

> 原文：Disciplined diagnosis loop for hard bugs and performance regressions. Reproduce → minimise → hypothesise → instrument → fix → regression-test. Use when user says "diagnose this" / "debug this", reports a bug, says something is broken/throwing/failing, or describes a performance regression.

正文 ≤ 100 行，超出拆分到 REFERENCE.md。

### 4.2 触发方式：精确关键词

description 中列举触发短语：`"diagnose this"`、`"debug this"`、`"broken"`、`"throwing"`、`"failing"`。而非 Superpowers 的 "You MUST"。

### 4.3 注册机制

**出处**：`repos/mattpocock/CLAUDE.md` L10-14

```markdown
engineering/、productivity/、misc/ 下的每个 Skill 必须在顶层 README.md 中有引用，
且在 .claude-plugin/plugin.json 中有条目。personal/、in-progress/、deprecated/
下的 Skill 不得出现在两者中。
```

> 原文：Every skill in engineering/productivity/misc must have a reference in README.md and an entry in .claude-plugin/plugin.json. Skills in personal/in-progress/deprecated must not appear in either.

`plugin.json` + `README.md` 双注册区分对外/对内 Skill。

### 4.4 渐进式披露

```
SKILL.md（< 100 行）         ← 核心流程
REFERENCE.md（按需）          ← 详细参考
examples/（按需）             ← 示例
```

---

## 五、对比总结

| 维度 | Superpowers | OpenSpec | GSD | Matt Pocock |
|------|------------|----------|-----|-------------|
| **数量** | 14 | 11（Profile 组织） | 69 命令 + 34 Agent | 22（6 类） |
| **生成方式** | 手写 Markdown | TypeScript 模板编译 | 手写 + 安装时布局 | 手写 Markdown |
| **触发策略** | SessionStart 强制自引导 | Slash 命令手动 | Slash 命令手动 | Slash 命令手动 |
| **触发语言** | "你必须" 命令式 | Schema 定义自动 | Capability 描述符 | 精确关键词匹配 |
| **Token 优化** | 按需加载 | CLI --json | **92% 削减**（两级路由） | 100 行上限 + REFERENCE.md |
| **单 Skill 复杂度** | 重（完整流程管控） | 中（模板 + CLI） | 极重（路由 + 命令双层） | 轻（单一职责） |

### 核心哲学差异

- **Superpowers**：Skill 是流程控制器，不信任 Agent 会自觉触发 → 注入引导
- **OpenSpec**：Skill 是产物说明书，Agent 通过 CLI 查询状态确定下一步
- **GSD**：Skill 是路由优化后的命令，Agent 只能看到 6 个入口
- **Matt Pocock**：Skill 是工具箱，自由组合
