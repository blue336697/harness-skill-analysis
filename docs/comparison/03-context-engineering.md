# 上下文工程对比

> 四个项目如何管理 LLM 上下文窗口、优化 Token、防止 Context Rot。

## 一、GSD：极致 Token 优化 + 状态外化

### 1.1 两级路由：92% 削减

**出处**：`repos/gsd/CONTEXT.md`

```
69 个命令 → 6 个路由器（gsd-ns-*）
Token 增量：约 2,150 → 约 120（削减 94%）
```

Agent 只看到 6 个路由 Skill，调用后路由器才加载子命令。

**出处**：`repos/gsd/CONTEXT.md` Installer Module L116-117

> 七种非递归 Skill 加载器的运行时使用嵌套路由器布局：6 个 `gsd-ns-*` 路由 bundle 作为顶层 Skill，具体 Skill 嵌套在 `<router>/skills/<name>/SKILL.md`。

### 1.2 CONTEXT.md：155KB 机器可 grep 知识图谱

**出处**：`repos/gsd/CONTEXT.md` L1-8

```markdown
# 上下文
> **格式**：本文档支持机器 grep。每个操作事实是单行断言
> （`CLASS.subkey=value`）。Agent 简报按 ID 逐字引用断言——
> **禁止改写本文档内容**。新知识以断言形式添加；时间顺序的记录
> 放在底部的会话日志中。
```

> 原文：this document is machine-greppable. Each operational fact is a single-line predicate. Agent briefs cite predicates by ID verbatim — never paraphrase.

### 1.3 状态外化

```yaml
# STATE.md
gsd_state_version: 1            # 状态格式版本
milestone: "v1.0"               # 当前里程碑
status: executing                # 项目状态：执行中
active_phase: execute            # 活跃阶段
```

原子锁 O_EXCL + 10 秒过期。Crash Recovery 通过 `/gsd-pause-work` + `/gsd-resume-work` 实现完整检查点。

### 1.4 Fresh Context per Task

```
第1波: [子Agent A → 全新 200K 上下文 → 任务1] ∥ [子Agent B → 全新 200K → 任务2]
第2波: [子Agent C → 全新 200K → 任务3]
```

波内并行，波间串行，每个 executor 获得干净上下文。

### 1.5 Context-budget 规则

按窗口大小自适应读取深度。编排器使用 xhigh effort，轻量命令使用 low effort。

---

## 二、Matt Pocock：领域语言 + 最小侵入

### 2.1 CONTEXT.md：精确定义 + 避免歧义

**出处**：`repos/mattpocock/CONTEXT.md` L1-27

```markdown
## 语言定义

**Issue Tracker（问题追踪器）**：
托管仓库 Issue 的工具——GitHub Issues、Linear、本地 `.scratch/` Markdown 约定等。
_避免使用_：backlog manager、backlog backend、issue host

**Issue（问题）**：
**Issue Tracker** 中的单个可追踪工作单元——Bug、任务、PRD 或 /to-issues 产出的切片。
_避免使用_：ticket（仅在引用外部系统称其为 ticket 时使用）

**Triage Role（分类角色）**：
应用于 **Issue** 的规范状态机标签（如 `needs-triage`、`ready-for-agent`）。
每个角色映射到 Issue Tracker 中的真实标签字符串。
```

**对比 GSD CONTEXT.md**：GSD 是机器可 grep 断言数据库（155KB），Matt Pocock 是人类可读术语表（约 1KB）。完全不同哲学。

### 2.2 Caveman：75% 压缩

```bash
/caveman  # 将当前上下文压缩为精简指令，削减约 75% Token
```

### 2.3 SKILL.md ≤ 100 行

```
diagnose/
├── SKILL.md        ← 核心流程（< 100 行）
├── tests.md        ← 详细测试指南（按需加载）
├── mocking.md      ← Mock 指南（按需加载）
└── AGENT-BRIEF.md  ← Agent 简报（按需加载）
```

**出处**：`repos/mattpocock/skills/engineering/diagnose/SKILL.md` L16-17

> 参见 tests.md 获取示例，参见 mocking.md 获取 Mock 指南。

---

## 三、OpenSpec：编译时 + 运行时双层

### 3.1 双渠道注入

```
编译时：TypeScript 模板 → SKILL.md（静态 Skill 文件）
运行时：openspec instructions --json → 动态状态数据
```

Agent 通过 CLI 获取当前 Artifact 状态，而非在 LLM 上下文中维护。

### 3.2 50KB 限制

```yaml
# config.yaml
context: "项目使用 React + TypeScript。遵循函数式编程范式。"
rules: "禁止使用 any 类型。所有函数必须显式标注返回类型。"
```

### 3.3 Change 目录自包含

```
openspec/changes/<变更ID>/
├── proposal.md      # 提案
├── specs/           # 规格
├── design.md        # 设计
├── tasks.md         # 任务
└── .openspec.yaml   # 状态跟踪
```

删除目录 = 撤销变更。每个 Change 是自包含上下文单元。

---

## 四、Superpowers：固定引导 + 按需加载

### 4.1 SessionStart 全量注入

**出处**：`repos/superpowers/hooks/session-start` L18,35

```bash
# 读取引导 Skill 全文
using_superpowers_content=$(cat "${PLUGIN_ROOT}/skills/using-superpowers/SKILL.md")
# 包装后注入
session_context="<极其重要>\n你拥有超级能力。\n\n
**以下是你的 'superpowers:using-superpowers' Skill 的完整内容——你使用 Skill 的指南：**\n\n
${using_superpowers_escaped}\n</极其重要>"
```

`using-superpowers/SKILL.md` 全文在每个会话中占固定 Token 成本。这是 trade-off——固定成本换取 Agent 必定知道要检查 Skills。

### 4.2 Git Worktree 隔离

Sub-agent 任务在独立 worktree 中执行，物理上下文隔离。

---

## 五、对比总结

| 维度 | Superpowers | OpenSpec | GSD | Matt Pocock |
|------|------------|----------|-----|-------------|
| **Token 优化** | 按需加载 | 50KB + CLI JSON | **92%**（两级路由） | 100 行 + REFERENCE.md |
| **知识载体** | using-superpowers 引导 | config.yaml + Schema.yaml | CONTEXT.md（155KB 断言数据库） | CONTEXT.md（术语表） |
| **状态存储** | Git worktree | 文件存在 = 状态 | STATE.md + 原子锁 | Issue Tracker |
| **上下文隔离** | worktree 物理隔离 | Change 目录自包含 | Fresh context per executor | 无 |
| **Crash Recovery** | Git commit | 删除 change 目录 | 完整检查点 | 外部工具 |
| **知识格式** | Markdown 散文 | YAML 结构化 | `CLASS.key=value` 断言 | 术语表 + 关系 + 歧义记录 |

### 哲学差异

- **GSD**：上下文是稀缺资源 → 极致优化 + 状态外化 + fresh context
- **Matt Pocock**：上下文应精炼 → 领域语言消除歧义 + 100 行上限
- **OpenSpec**：上下文应结构化 → 编译时生成 + CLI JSON 查询
- **Superpowers**：上下文需强制引导 → 固定 Token 成本换确定性
