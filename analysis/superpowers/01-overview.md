# Superpowers 分析报告

> **仓库**: [obra/superpowers](https://github.com/obra/superpowers) | 228K+ Stars | MIT License
> **定位**: Agent 技能框架 + 完整软件方法论

## 核心理念

Superpowers 是一套完整的软件开发方法论，封装为可组合的 Skill。核心主张：**AI Agent 不应该拿到需求就直接写代码**，而是应先通过结构化流程来推理、设计、计划、再执行。

### 四大哲学
- **Test-Driven Development** — 始终先写测试
- **Systematic over ad-hoc** — 流程优于猜测
- **Complexity reduction** — 简洁是首要目标
- **Evidence over claims** — 声称成功前必须先验证

## 差异化特点

| 维度 | Superpowers | 典型技能系统 |
|------|------------|-------------|
| 方法论深度 | 端到端全流程，流程型Skill而非参考型 | 多为参考型/API文档型 |
| 强制力 | HARD-GATE、Iron Law、Red Flags、理性化表格 | 通常无强制机制 |
| Multi-Agent | 内置 subagent-driven-development，两级审查 | 大部分系统无 |
| Skill开发 | TDD循环应用于Skill写作本身 | 无此方法论 |
| 跨平台 | 官方支持 8+ Agent平台 | 通常只绑一个 |
| 心理学设计 | 应用Cialdini说服原则防理性化违规 | 无此设计 |

## 工作流

```
brainstorming → using-git-worktrees → writing-plans
    → subagent-driven-development (核心)
    → requesting-code-review → finishing-a-development-branch
```

## 核心机制

### TDD 强制执行（六层防御）
1. Iron Law: "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST"
2. HARD-GATE: 设计批准前禁止写代码
3. Red Flags: Agent自我检查违反信号
4. 理性化表格: 预驳所有跳过TDD的借口
5. 违反即重启: 删除代码，重新开始
6. 验证Gate: 必须运行命令并展示输出

### Subagent-Driven Development
- 逐任务执行循环: Implementer → Spec Review → Code Quality Review
- 两级审查独立串行执行
- 四个返回状态: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED

### 上下文注入
- SessionStart Hook → run-hook.cmd → session-start 脚本
- 读取 using-superpowers/SKILL.md 全文注入到 Agent 上下文
- "如果你觉得有任何1%的可能一个Skill适用，你必须调用Skill工具"
