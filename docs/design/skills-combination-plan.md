# Skills 组合方案

> 分析四个 Harness 项目的 Skills，按项目生命周期两阶段设计最优组合。
> 阶段一（初始化）→ Superpowers 为主，阶段二（敏捷迭代）→ Matt Pocock 为主。

## 一、选型逻辑

### 1.1 四个项目的 Skill 风格对比

| 维度 | Superpowers | OpenSpec | GSD | Matt Pocock |
|------|------------|----------|-----|-------------|
| **Skill 数量** | 14 | 11 | 69 命令 + 34 Agent | 22（6 类） |
| **设计哲学** | 流程强制 + 方法论完整 | SDD 规约驱动 | 上下文工程 + 编排 | 小、独立、可组合 |
| **强制力** | ★★★★★ (HARD-GATE) | ★★★ (Artifact DAG) | ★★★★ (hooks+gate) | ★ (信任用户) |
| **学习成本** | 中 | 中 | 极高 | 低 |
| **单 Skill 复杂度** | 重（每个 Skill 管控一个完整阶段） | 中（模板生成，CLI 辅助） | 极重（两级路由+Capability 描述符） | 轻（单文件 < 100 行） |
| **适合阶段** | 初始化 | 全过程（偏好存量项目） | 长周期大型项目 | 敏捷迭代 |

### 1.2 选型原则

1. **阶段一选 Superpowers**：初始化需要方法论强制力。Superpowers 的 HARD-GATE + 9 步 brainstorming 是唯一真正阻止 Agent "直接写代码"的机制。
2. **阶段二选 Matt Pocock**：敏捷需要快速反馈。Matt Pocock 每个 Skill 独立、< 100 行、不依赖其他 Skill，适合单任务快速执行。
3. **不选 GSD 作为主要来源**：69 命令 + 34 Agent 过于复杂，需要安装运行时，不适合作为团队通用规范。
4. **OpenSpec 作为可选替代**：如果团队偏好 SDD，可以用 OpenSpec 的 propose/explore/apply 替代 Superpowers 的 brainstorming/writing-plans。

---

## 二、阶段一：项目初始化 Skill 组合

### 2.1 工作流

```
用户需求
  │
  ▼
┌─────────────────────────────────────────────┐
│ ① brainstorming (Superpowers)               │
│   探索上下文 → 逐次提问 → 2-3方案对比 → 设计文档│
│   HARD-GATE: 设计批准前禁止写任何代码          │
│   输出：docs/superpowers/specs/<设计文档>     │
└──────────────┬──────────────────────────────┘
               │ 用户批准设计
               ▼
┌─────────────────────────────────────────────┐
│ ② writing-plans (Superpowers)               │
│   文件结构映射 → 任务分解(每任务2-5分钟)       │
│   输出：docs/superpowers/plans/<实施计划>     │
└──────────────┬──────────────────────────────┘
               │ 用户批准计划
               ▼
┌─────────────────────────────────────────────┐
│ ③ to-issues (Matt Pocock) [可选]            │
│   垂直切片拆分 → Issue Tracker 卡片           │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ ④ subagent-driven-development (Superpowers) │
│   逐任务循环：Implementer → Review → 下一任务  │
│   每个任务 = 独立 sub-agent + git worktree    │
│   两级审查：Spec Review + Code Quality Review │
└──────────────┬──────────────────────────────┘
               │ 所有任务完成
               ▼
┌─────────────────────────────────────────────┐
│ ⑤ verification-before-completion (Superpowers)│
│   功能验证 → 测试检查 → 完成确认               │
└─────────────────────────────────────────────┘
```

### 2.2 核心 Skill 详解

#### ① brainstorming — 初始化阶段的第一道防线

**来源**：Superpowers  
**文件**：`repos/superpowers/skills/brainstorming/SKILL.md`

**为什么必选**：
- 唯一真正强制 Agent 在编码前进行设计对话的 Skill
- HARD-GATE 机制：`"Do NOT invoke any implementation skill, write any code, or take any implementation action until you have presented a design and the user has approved it."`
- 9 步流程：探索上下文 → 视觉辅助 → 逐次提问 → 方案对比 → 设计呈现 → 写设计文档 → 自审 → 用户审阅 → 转实施
- **一次性只问一个问题**，避免信息过载
- 即使是"简单"项目也必须走完流程（这是它的核心价值，不是 bug）

**触发**：创建功能、构建组件、添加功能、修改行为

#### ② writing-plans — 设计到实施的桥梁

**来源**：Superpowers  
**文件**：`repos/superpowers/skills/writing-plans/SKILL.md`

**为什么必选**：
- 将设计分解为 2-5 分钟的可执行任务
- 每个任务完整描述文件路径、代码结构、测试方法
- 假设执行者不了解代码库（适合 sub-agent 执行）
- 强制文件结构映射在任务分解之前

#### ③ to-issues [可选] — 计划转 Issue 卡片

**来源**：Matt Pocock  
**文件**：`repos/mattpocock/skills/engineering/to-issues/SKILL.md`

**何时用**：团队使用 GitHub Issues / Linear 等 Issue Tracker  
**何时跳过**：团队不跟踪 Issue 或项目太小

#### ④ subagent-driven-development — 质量保障的执行引擎

**来源**：Superpowers  
**文件**：`repos/superpowers/skills/subagent-driven-development/SKILL.md`

**为什么必选**：
- 逐任务循环：Implementer sub-agent → Spec Review → Code Quality Review
- 每个任务在独立的 git worktree 中执行（上下文隔离）
- 两级审查：Spec Review（规格符合度） + Code Quality Review（代码质量）
- 四个返回状态：DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED

#### ⑤ verification-before-completion — 完成前的最后检查

**来源**：Superpowers  
**为什么必选**：确保"声称完成"前进行了系统验证，防止 Agent 过早宣布完成

### 2.3 阶段一文件清单

```bash
skills/
├── brainstorming/SKILL.md            # ← Superpowers
├── writing-plans/SKILL.md            # ← Superpowers
├── subagent-driven-development/SKILL.md # ← Superpowers
├── test-driven-development/SKILL.md  # ← Superpowers（阶段一 TDD，含 Iron Law）
├── requesting-code-review/SKILL.md   # ← Superpowers
├── verification-before-completion/SKILL.md # ← Superpowers
├── using-git-worktrees/SKILL.md      # ← Superpowers
├── using-superpowers/SKILL.md        # ← Superpowers ★ 必须！SessionStart 入口
├── to-issues/SKILL.md                # ← Matt Pocock [可选]
└── to-prd/SKILL.md                   # ← Matt Pocock [可选]

hooks/
├── hooks.json                        # SessionStart Hook 配置
└── session-start                     # 注入 using-superpowers 引导指令
```

---

## 三、阶段二：敏捷迭代 Skill 组合

### 3.1 工作流

```
Issue / Bug 报告
  │
  ├── 是 Bug？
  │     │
  │     ▼
  │   ┌─────────────────────────────────────┐
  │   │ ① diagnose (Matt Pocock)             │
  │   │   Phase 1: 构建反馈循环（核心）        │
  │   │   Phase 2: 复现                      │
  │   │   Phase 3: 假设                      │
  │   │   Phase 4: 仪器化                    │
  │   │   Phase 5: 修复 + 回归               │
  │   │   Phase 6: 事后分析                  │
  │   │   核心理念：Build the feedback loop   │
  │   │   and the bug is 90% fixed.          │
  │   └──────────────┬──────────────────────┘
  │                  │
  │                  ▼
  │   ┌─────────────────────────────────────┐
  │   │ ② tdd (Matt Pocock)                  │
  │   │   垂直切片循环：一个测试→一个实现       │
  │   │   禁止水平切片                        │
  │   └──────────────┬──────────────────────┘
  │                  │
  ├── 是小需求？
  │     │
  │     ▼
  │   ┌─────────────────────────────────────┐
  │   │ ③ triage (Matt Pocock)               │
  │   │   Issue 状态机：                     │
  │   │   unlabeled → needs-triage →         │
  │   │   needs-info / ready-for-agent /     │
  │   │   ready-for-human / wontfix          │
  │   └──────────────┬──────────────────────┘
  │                  │
  │                  ▼
  │   ┌─────────────────────────────────────┐
  │   │ ④ grill-me (Matt Pocock) [可选]      │
  │   │   追问需求细节、边缘情况、验收标准     │
  │   └──────────────┬──────────────────────┘
  │                  │
  │                  ▼
  │   ┌─────────────────────────────────────┐
  │   │ ⑤ tdd (Matt Pocock)                  │
  │   │   同 Bug 修复的垂直切片循环            │
  │   └──────────────┬──────────────────────┘
  │                  │
  └──────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│ ⑥ code-review (Matt Pocock)                 │
│   CRITICAL → HIGH → MEDIUM → LOW 四级       │
│   覆盖：安全 + 代码质量 + 性能               │
└─────────────────────────────────────────────┘
```

### 3.2 核心 Skill 详解

#### ① diagnose — 诊断循环 ★★★★★ 敏捷核心

**来源**：Matt Pocock  
**文件**：`repos/mattpocock/skills/engineering/diagnose/SKILL.md`

**为什么选它**：
- Phase 1 "构建反馈循环" 是灵魂：**在能复现之前不做任何假设**
- 10 种反馈循环构建方法（test → curl → CLI → browser script → replay → harness → fuzz → bisect → diff → HITL）
- 对非确定性 Bug 有专门策略（"目标不是精确复现，而是提高复现率"）
- 第 10 级反馈循环优先级系统确保 Agent 从最简单的方式开始

**与 Superpowers systematic-debugging 的对比**：
- diagnose 更轻量，聚焦"构建反馈循环"这一件事
- systematic-debugging 更完整但流程更重
- 敏捷阶段选 diagnose，因为速度优先于完整性

> "Build the right feedback loop, and the bug is 90% fixed."

#### ② tdd (Matt Pocock 版本) ★★★★★ 敏捷核心

**来源**：Matt Pocock  
**文件**：`repos/mattpocock/skills/engineering/tdd/SKILL.md`

**为什么选 Matt Pocock 的 TDD 而非 Superpowers 的 TDD**：
- 无 HARD-GATE，流程更轻，适合快速迭代
- 强调**垂直切片**明确禁止水平切片
- 每个 RED→GREEN→REFACTOR 循环独立完成
- 对 mock 有明确原则：测试行为，不测试实现

**核心反模式**：
```
禁止（水平切片）：
  RED:   5个测试全部写完
  GREEN: 5个实现全部写完

正确（垂直切片）：
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  ...
```

#### ③ triage — Issue 状态机 ★★★★

**来源**：Matt Pocock  
**文件**：`repos/mattpocock/skills/engineering/triage/SKILL.md`

**为什么选它**：
- 7 种角色（2 类别 + 5 状态）的清晰状态机
- 自动分类和路由 Issue
- 区分 "ready-for-agent" vs "ready-for-human"
- 兼容 GitHub Issues / Linear / 本地 `.scratch/`

**状态转换**：
```
unlabeled → needs-triage
  → needs-info → needs-triage (reporter replies)
  → ready-for-agent
  → ready-for-human
  → wontfix
```

#### ④ grill-me [可选] — 需求澄清

**来源**：Matt Pocock  
**何时用**：需求描述不够具体，或用户随口说出需求时  
**何时跳过**：需求已清晰或已在 triage 中充分讨论

#### ⑤ code-review — 四级审查 ★★★★

**来源**：Matt Pocock（或系统内置 `/code-review`）  

**为什么选它**：
- CRITICAL → HIGH → MEDIUM → LOW 四级分类
- 安全检查：硬编码密钥、SQL 注入、XSS、路径遍历
- 代码质量检查：大函数、深层嵌套、错误处理
- 比 Superpowers 的两级审查（Spec + Quality）更适合单次小修改

### 3.3 阶段二文件清单

```bash
skills/
├── diagnose/SKILL.md                        # ← Matt Pocock ★
├── tdd/SKILL.md                             # ← Matt Pocock ★
├── triage/SKILL.md                          # ← Matt Pocock ★
├── code-review/SKILL.md                     # ← Matt Pocock
├── grill-me/SKILL.md                        # ← Matt Pocock [可选]
├── to-issues/SKILL.md                       # ← Matt Pocock [可选]
├── improve-codebase-architecture/SKILL.md   # ← Matt Pocock [可选]
├── git-guardrails-claude-code/SKILL.md      # ← Matt Pocock（必装）
├── caveman/SKILL.md                         # ← Matt Pocock [可选]
└── using-superpowers/SKILL.md               # ← Superpowers ★ 仍需！
```

**注意**：即使阶段二以 Matt Pocock 为主，`using-superpowers` 仍必须保留。它是 SessionStart 自引导的入口，确保 Agent 在每个会话开始时知道要检查 Skills。只是阶段二时它的行为应该调整为"敏捷模式"（去掉 HARD-GATE，改为 Checkpoint 提示）。

---

## 四、两阶段共用基础设施

### 4.1 必须始终安装

| 组件 | 来源 | 为什么必须 |
|------|------|-----------|
| `using-superpowers/SKILL.md` | Superpowers | SessionStart 自引导。没有它 Agent 可能不主动检查 Skills |
| `git-guardrails-claude-code/SKILL.md` | Matt Pocock | 拦截危险 Git 操作：push --force、hard reset、branch -D |
| `hooks/hooks.json` | 自定义 | SessionStart Hook 配置 |
| `hooks/session-start` | 自定义 | 注入阶段标记 + using-superpowers 引导 |

### 4.2 SessionStart 脚本

```bash
#!/usr/bin/env bash
# hooks/session-start
set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BOOTSTRAP="${PLUGIN_ROOT}/skills/using-superpowers/SKILL.md"

# 读取当前阶段
PHASE="INIT"
[ -f "${PLUGIN_ROOT}/.phase" ] && PHASE=$(cat "${PLUGIN_ROOT}/.phase")

# JSON 转义并注入
# ... 参见 Superpowers 的 run-hook.cmd 实现
```

### 4.3 阶段切换

```bash
# 从 INIT 切到 AGILE
echo "AGILE" > .claude/.phase

# 移除阶段一重流程 Skills
rm -rf skills/brainstorming
rm -rf skills/writing-plans
rm -rf skills/subagent-driven-development
rm -rf skills/using-git-worktrees
rm -rf skills/verification-before-completion

# 添加阶段二 Skills
cp -r <mattpocock-skills>/diagnose skills/
cp -r <mattpocock-skills>/tdd skills/
cp -r <mattpocock-skills>/triage skills/
cp -r <mattpocock-skills>/code-review skills/

# 更新根 CLAUDE.md
# 移除 HARD-GATE 相关约束
# 添加敏捷规则
```

---

## 五、Skill 使用规则（写入根 CLAUDE.md）

```markdown
## Skill 使用策略

### 主动检查
收到任何任务后，先检查是否有对应的 Skill。
即使 1% 可能适用，也必须调用 Skill 工具查看。

### 优先级
1. 流程 Skill 优先（brainstorming / diagnose / tdd / triage）
2. 实现 Skill 其次
3. 工具 Skill 最后

### 禁止跳过
如果 Skill 要求用户批准才能进入下一步，必须等待。不能找理由跳过。

### 冲突处理
多 Skill 冲突时，优先使用与当前项目阶段匹配的。
当前阶段见 SessionStart 注入的 <phase-marker>。

### 子代理豁免
作为子代理被派发执行具体任务时，跳过 using-superpowers 引导。
```

### 用户调用速查

| 场景 | 调用 | 触发的 Skill 链 |
|------|------|---------------|
| **阶段一** | | |
| 新功能 | `/brainstorming` | brainstorming → writing-plans → to-issues → subagent-driven-development |
| PRD | `/to-prd` + 描述 | to-prd |
| Issue 拆分 | `/to-issues` | to-issues |
| **阶段二** | | |
| Bug 修复 | `/diagnose` 或直接描述 | diagnose → tdd → code-review |
| 小需求 | `/triage` + Issue 编号 | triage → tdd → code-review |
| 需求澄清 | `/grill-me` + 描述 | grill-me |
| 代码审查 | `/code-review` | code-review |
| 重构 | `/improve-codebase-architecture` | improve-codebase-architecture |
| **共用** | | |
| Token 紧张 | `/caveman` | caveman（压缩 75% 上下文） |

---

## 六、方案对比与替代

### 为什么不用纯 OpenSpec？

- OpenSpec 需要 CLI 工具（`openspec`），增加安装步骤
- OpenSpec 的 SDD 更适合**存量项目的增量变更**
- Superpowers 的 brainstorming 在设计阶段有更完整的人机交互流程
- **替代方案**：如果团队已有 CI/CD 且偏好规约驱动，可用 OpenSpec 替换阶段一的 Superpowers

### 为什么不用纯 GSD？

- 69 命令 + 34 Agent + 37 Capability 学习成本极高
- 需要安装 GSD 运行时
- 两级路由适合 > 50 模块的大型项目，对大多数团队过度设计
- **借鉴价值**：GSD 的上下文工程思路（CONTEXT.md + 状态外化 + fresh context）值得学习

### 本方案的核心权衡

| 决策 | 理由 |
|------|------|
| 阶段一 Superpowers > OpenSpec | HARD-GATE 强制力对规范执行更关键 |
| 阶段二 Matt Pocock > Superpowers | 重流程在敏捷阶段是负担 |
| 保留 using-superpowers 不停用 | 它是 Skill 自动发现的"开关" |
| 不引入 GSD 运行时 | 安装复杂度与收益不成比例 |
| git-guardrails 始终安装 | Git 安全是底线 |
