# 原生 Claude Code 实验过程记录

## 实验概述
- **Harness**: 原生 Claude Code（无第三方插件）
- **核心机制**: CLAUDE.md + Memory + 内置 Slash 命令 + Sub-agent
- **结果**: 7/7测试通过
- **中间文件**: **仅 1 个** — CLAUDE.md

---

## 原生 CC 内置 Slash 命令一览

| 命令 | 功能 | 产生中间文件？ |
|------|------|:---:|
| `/init` | 分析代码库，创建/更新 CLAUDE.md | ✅ CLAUDE.md |
| `/code-review` | 7角度发现 + 1票验证，输出 JSON 结果 | ❌ |
| `/security-review` | 安全漏洞扫描（OWASP Top 10） | ❌ |
| `/simplify` | 重构：消除重复、简化逻辑 | ❌ (直接改代码) |
| `/verify` | 验证代码变更是否工作 | ❌ |
| `/run` | 启动项目查看变更效果 | ❌ |
| `/review` | PR 代码审查 | ❌ |
| `/loop` | 定时循环执行命令 | ❌ |

## 原生 CC 内置 Support 能力

| 能力 | 说明 |
|------|------|
| **CLAUDE.md** | 会话启动时自动读取的项目指令文件 |
| **Memory 系统** | 跨会话持久记忆 (`~/.claude/projects/`) |
| **Plan Mode** | EnterPlanMode/ExitPlanMode 结构化对话规划 |
| **Task 工具** | TaskCreate/TaskUpdate/TaskList 会话内追踪 |
| **Sub-agent** | Agent 工具，30+ 专业子代理类型 |
| **Hooks 系统** | settings.json 配置 PreToolUse/PostToolUse/Stop/SessionStart |

## 原生 CC 没有的东西

| 缺失能力 | 谁提供了 |
|---------|---------|
| 结构化规划文档 (proposal/design/specs/tasks) | OpenSpec |
| 设计门控 (HARD-GATE) | Superpowers |
| 2-5分钟微任务 + 每步含完整代码 | Superpowers writing-plans |
| 依赖波并行执行 | GSD execute-phase |
| Fresh Context 子代理 | GSD |
| 上下文监控 Hook | GSD context-monitor |
| 对话式 UAT | GSD verify-work |
| 领域语言强制 (CONTEXT.md) | Matt Pocock |
| 垂直切片分解 | Matt Pocock to-issues |
| Issue Tracker 集成 | Matt Pocock |
| SessionStart 自动引导注入 | Superpowers |

---

## 实验流程

### Step 1: `/init`
- **触发**: `Skill("init")`
- **输出**: `CLAUDE.md`（~70行）
- **中间文件**: 仅此一个

### Step 2: 开发
- 无结构化规划阶段（无 proposal/design/specs/tasks）
- 无设计门控（AI 可直接写代码）
- 无强制 TDD
- 开发者自行决定开发顺序

### Step 3: `/code-review`（测试调用）
- **机制**: 7个独立发现角度 → 1票验证 → JSON 输出
- **中间文件**: 无（结果不写入文件）

---

## 五个 Harness 中间文件数量对比

| 工程 | 中间文件数 | 核心文件 |
|------|:---:|------|
| **原生 CC** | **1** | CLAUDE.md |
| OpenSpec | 14 | config.yaml + proposal/design/specs/tasks + 4skills+4commands |
| Superpowers | 2 | design doc + plan(含完整代码) |
| GSD | 6 | PROJECT + REQUIREMENTS + ROADMAP + STATE + CONTEXT + config.json |
| Matt Pocock | 8 | CONTEXT.md + ADR + PRD + 5垂直切片issues |

## 核心发现

1. **原生 CC 只有 CLAUDE.md 一个 harness 级文件**：所有结构化规划文档都是第三方插件补充的
2. **原生 CC 选择"极简 harness"路线**：CLAUDE.md + Memory + 内置命令，不强制任何工作流
3. **原生 CC 的强项是 agentic 工具**（code-review 7角度、verify、sub-agents），而非流程约束
4. **适合已有成熟流程的团队**；第三方 Harness 适合需要"开箱即用流程"的团队
5. CLAUDE.md 是静态指令文件，不像 GSD 的 STATE.md 会动态更新进度
