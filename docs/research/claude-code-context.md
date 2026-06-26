# Claude Code 上下文加载机制

> 本文档系统性地梳理 Claude Code 的上下文加载顺序、优先级、各组件之间的关系，为制定团队开发规范提供理论基础。

## 一、整体架构

Claude Code 的上下文注入分为 **六个层次**（5 个标准层 + Memory 机制），按时间线和优先级排列：

```
Session 启动
│
├── Layer 1: 静态指令文件（无条件注入，最早加载）
│   ├── ① ~/.claude/CLAUDE.md          （用户级，最低优先级）
│   ├── ② <project>/CLAUDE.md          （项目级）
│   ├── ③ <project>/.claude/CLAUDE.local.md （项目本地，最高优先级）
│   ├── ④ <project>/.claude/rules/*.md （规则目录，所有 .md 文件）
│   └── ⑤ 父目录 CLAUDE.md              （从工作目录向上遍历到项目根）
│
├── Layer 2: SessionStart Hook（会话启动时触发，动态注入）
│   └── hooks.json → command/prompt → additionalContext
│
├── Layer 3: Skills 渐进式加载（始终注册，按需加载全文）
│   ├── 元数据层（name + description）永远在上下文
│   ├── SKILL.md 正文仅在触发时加载
│   └── 捆绑资源（scripts/references/assets）按需加载
│
├── Layer 4: settings.json（配置层，不直接注入上下文）
│   ├── ~/.claude/settings.json         （用户级）
│   ├── <project>/.claude/settings.json （项目级）
│   └── <project>/.claude/settings.local.json （项目本地）
│
├── Layer 5: 对话历史（会话运行时累积）
│   ├── 用户消息 + Agent 回复
│   ├── 工具调用 + 工具结果
│   └── 自动压缩（compaction）当接近上下文上限
│
└── Memory 机制: 持久化知识库（独立于五层，按需召回）
    ├── MEMORY.md 索引（会话启动时加载，仅标题行，~50-200 tokens）
    ├── 单文件单事实（一个 .md 文件一条 knowledge）
    └── 按语义匹配动态召回（以 <system-reminder> 注入对话）
```

### 关键环境变量

| 变量 | 作用 |
|---|---|
| `CLAUDE_CODE_SIMPLE` | 禁用 CLAUDE.md、rules、MCP、hooks、attachments、skills |
| `CLAUDE_CODE_MAX_CONTEXT_TOKENS` | 设置上下文 token 上限 |
| `CLAUDE_PLUGIN_ROOT` | SessionStart hook 中标识当前为 Claude Code 运行环境 |

---

## 二、Layer 1: CLAUDE.md 静态指令加载

### 2.1 加载路径与优先级

CLAUDE.md 按 **从低到高** 的优先级顺序加载（低优先级内容先加载，高优先级后加载，当超出长度限制时低优先级内容先被截断）：

```
优先级（由低到高）：
  User CLAUDE.md  →  Project CLAUDE.md  →  Project CLAUDE.local.md
  (~/.claude/)       (<project>/)          (<project>/.claude/)
```

### 2.2 嵌套目录加载行为

当 Claude Code 在项目子目录中工作时：

1. **向上遍历**：从当前工作目录向上遍历到项目根目录
2. **加载所有 CLAUDE.md**：路径上的每个 CLAUDE.md 都会被加载
3. **项目根目录 CLAUDE.md** 始终被加载

```
示例：假设工作目录为 /project/src/components/button/

加载内容（按顺序）：
  ~/.claude/CLAUDE.md              ← 用户级
  /project/CLAUDE.md               ← 项目根
  /project/src/CLAUDE.md           ← （如果存在）
  /project/src/components/CLAUDE.md ← （如果存在）
```

### 2.3 `.claude/rules/*.md` 规则目录

位于 `<project>/.claude/rules/` 下的所有 `.md` 文件会被自动加载为项目指令。

```
.claude/rules/
├── coding-style.md      ← 自动加载
├── testing.md           ← 自动加载
├── git-workflow.md      ← 自动加载
└── subdir/
    └── security.md      ← 也会被加载
```

**特点**：
- 所有 `.md` 文件无条件加载，不需要显式引用
- 用于拆分大型 CLAUDE.md 为细粒度规则（避免单个文件过大）
- `InstructionsLoaded` hook 事件在 CLAUDE.md 和 rules 文件加载完成后触发

### 2.4 内容截断机制

当 CLAUDE.md 内容总长度超出限制时：
- **低优先级内容先被截断**（用户级 → 项目级 → 项目本地级）
- 内容被顺序拼接后再统一截断（不是每个文件独立截断）
- 结论：**最重要、最具体的规则应该放在优先级最高的文件中**（.claude/CLAUDE.local.md 或项目级 CLAUDE.md）

### 2.5 上下文包装

CLAUDE.md 和 rules 的内容被加载后，会被包装在 XML 标签中以标记来源：

```xml
<project-context>
  <!-- CLAUDE.md 内容 -->
</project-context>
```

这种包装提供了出处信息，让 Agent 明确知道指令来源。

---

## 三、Layer 2: SessionStart Hook 动态注入

### 3.1 触发时机

SessionStart Hook 在以下时机触发（通过 `matcher` 字段控制）：

```json
{
  "SessionStart": [
    {
      "matcher": "startup|clear|compact",
      "hooks": [...]
    }
  ]
}
```

| matcher 值 | 触发场景 |
|---|---|
| `startup` | 全新会话启动 |
| `clear` | 会话被清空后重新开始 |
| `compact` | 上下文压缩后重新开始 |

### 3.2 Hook 类型

| Hook 类型 | 执行方式 | 注入机制 |
|---|---|---|
| `command` | 执行 shell 脚本 | 脚本 stdout → `additionalContext` 注入上下文 |
| `prompt` | 触发 LLM 评估 | 评估结果注入上下文 |

### 3.3 上下文注入格式

SessionStart Hook 的输出通过 JSON 返回。Claude Code 读取 `hookSpecificOutput.additionalContext`：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<注入的内容文本>"
  }
}
```

异步模式 (`"async": true`) 下，hook 在后台执行，不阻塞会话启动。

### 3.4 Superpowers 的 SessionStart 实践（关键参考案例）

Superpowers 是 SessionStart Hook 最深入的使用者，其完整流程如下：

```
SessionStart 触发（startup|clear|compact）
  → run-hook.cmd session-start（跨平台包装脚本）
    → session-start 脚本执行：
      1. 读取 skills/using-superpowers/SKILL.md 全文
      2. 进行 JSON 转义
      3. 包装在 <EXTREMELY_IMPORTANT> 标签中
      4. 输出 JSON（区分 Claude Code / Cursor / Copilot CLI 格式）
    → using-superpowers 的引导指令被注入到每个会话的起始上下文
```

**注入内容的核心设计意图**：
```
"如果任何 skill 有 1% 的可能适用，你必须调用 Skill 工具。
 这不是可选的，不是可协商的，你不能找理由跳过。"
```

**这个设计的精妙之处**：
- Skills 系统本身是"按需加载"的，Agent 可能不会主动调用 Skill 工具
- 通过 SessionStart 注入强制引导指令，确保 Agent 在每个会话开始时就知道"必须检查 Skills"
- 这解决了 Skills 系统的根本弱点：触发依赖 Agent 的自觉性

### 3.5 完整 Hook 事件列表

| Hook 事件 | 触发时机 | 典型用途 |
|---|---|---|
| `SessionStart` | 会话启动/清空/压缩后 | 注入项目上下文、引导指令、阶段标记 |
| `PreToolUse` | 任何工具执行前 | 安全扫描、操作验证、权限检查 |
| `PostToolUse` | 任何工具执行后 | 自动格式化、状态更新、日志记录 |
| `Stop` | 会话结束 | 清理检查、任务完成验证 |
| `InstructionsLoaded` | CLAUDE.md/rules 加载完成 | 监控指令加载状态 |

---

## 四、Layer 3: Skills 渐进式加载

### 4.1 自动发现机制

Claude Code 自动扫描以下位置的 Skills：

```
~/.claude/skills/                    ← 用户级（全局所有项目可用）
<project>/.claude/skills/            ← 项目级（仅当前项目）
<plugin>/skills/                     ← 插件级（随插件安装）
```

每个 Skill 是一个包含 `SKILL.md` 的子目录。**无需显式注册**，存在即被发现。

### 4.2 三级渐进式加载（核心设计原则）

```
┌──────────────────────────────────────────────────┐
│ Level 1: 元数据（始终在上下文，无条件注入）        │
│ - name: skill 标识名                              │
│ - description: 触发条件和用途                     │
│ - 约 100 词                                       │
│ - 作用：让 Agent 知道有哪些 skill 可用            │
├──────────────────────────────────────────────────┤
│ Level 2: SKILL.md 正文（按需加载）                  │
│ - 仅当 Agent 调用 Skill 工具时加载                │
│ - 建议 500 行以下                                  │
│ - 作用：提供具体的工作流指令                       │
├──────────────────────────────────────────────────┤
│ Level 3: 捆绑资源（按需加载）                      │
│ - scripts/    可执行脚本（可在不占上下文的情况下执行）│
│ - references/ 参考文档（Agent 自行 Read）          │
│ - assets/     模板、图标等输出物                   │
│ - 作用：提供额外的数据和执行能力                   │
└──────────────────────────────────────────────────┘
```

### 4.3 SKILL.md 格式规范

```markdown
---
name: skill-name          # 必填，kebab-case，最长64字符
description: 详细触发条件  # 必填，最长1024字符，不能包含 < >
license: MIT              # 可选
allowed-tools:            # 可选
  - Read
  - Write
metadata:                 # 可选
  category: engineering
compatibility:            # 可选，最长500字符
---

# Skill 正文（Markdown）
```

### 4.4 description 字段 —— Skill 触发的唯一判断依据

`description` 是决定 Agent 是否调用 Skill 的**唯一信息源**。Agent 基于它对用户消息的理解 + Skill 的 description 来决定是否触发。

**设计原则**：
- 描述 **何时触发** 而非 **做了什么**
- 包含 **触发关键词和场景**
- 应该稍微 "pushy"，明确鼓励 Agent 使用
- 不要过于宽泛（会导致误触发），也不要过于狭窄（会导致被忽略）

```yaml
# ❌ 太模糊 —— Agent 不知道何时触发
description: Helps with testing

# ✅ 精确 —— Agent 清楚知道触发条件
description: Use when writing tests, fixing test failures, or setting up test
  frameworks. Triggers on keywords: test, testing, jest, vitest, coverage,
  mock, stub, assert. Enforces TDD: write failing test first, then implement.
```

### 4.5 Skill 触发流程

```
用户发送消息
  → Agent 检查所有 Skill 的 description（已在上下文）
    → 匹配到可能相关的 Skill？
      → 是：调用 Skill 工具 → SKILL.md 正文加载 → Agent 按指令执行
      → 否：正常响应
```

### 4.6 Skill description 与 CLAUDE.md 的分工

| 维度 | CLAUDE.md 中的引导 | Skill 的 description |
|---|---|---|
| **位置** | CLAUDE.md 或 SessionStart 注入 | SKILL.md frontmatter |
| **内容** | 全局规则（如"每次修改代码后必须 review"） | 单个 Skill 的触发条件 |
| **Token 成本** | 始终占用上下文 | 仅 description 常驻（~100词） |
| **建议** | 放跨 Skill 的通用规则和 Skill 使用策略 | 放每个 Skill 特定的触发词和场景 |

---

## 五、Layer 4: settings.json 配置

### 5.1 文件位置与优先级

```
~/.claude/settings.json               ← 用户级（最低优先级）
<project>/.claude/settings.json        ← 项目级
<project>/.claude/settings.local.json  ← 项目本地（最高优先级，不提交 git）
```

### 5.2 核心配置区

| 配置区 | 用途 | 团队实践 |
|---|---|---|
| `permissions` | 工具权限控制（allow/deny/ask） | 项目级 settings.json 配置团队默认权限 |
| `hooks` | Hook 事件配置 | 项目级配置 SessionStart 的上下文注入 |
| `plugins` | 插件启用/禁用 | 统一管理团队使用的插件 |
| `sandbox` | 沙箱安全设置 | 限制危险操作 |
| `model` | 模型选择 | 可统一团队使用的模型 |

### 5.3 permissions 配置示例

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test: *)",
      "Bash(git diff: *)",
      "Read"
    ],
    "ask": [
      "Bash(git push: *)"
    ],
    "deny": [
      "Bash(rm -rf: *)",
      "Bash(sudo: *)"
    ]
  }
}
```

---

## 六、Memory 机制：持久化知识库

Memory 是独立于五层标准上下文之外的第六种上下文来源。与 CLAUDE.md/rules 的"无条件全量加载"完全不同，Memory 走的是 **按需召回** 模式。

### 6.1 存储结构

```
C:\Users\<user>\.claude\projects\<project-hash>\memory\
├── MEMORY.md              ← 索引文件（每次会话加载，仅标题行）
├── some-fact.md           ← 单条 memory（一个文件一条事实）
├── another-fact.md
└── ...
```

### 6.2 Memory 文件格式

每个 memory 文件 = 一个独立的 `.md` 文件，包含 YAML frontmatter + Markdown 正文：

```markdown
---
name: <short-kebab-case-slug>
description: <one-line summary — used to decide relevance during recall>
metadata:
  type: user | feedback | project | reference
---

<the fact content>

**Why:** ...
**How to apply:** ...
```

### 6.3 加载机制：索引常驻 + 按需召回

```
会话启动
  │
  ├── MEMORY.md 索引被加载到系统提示
  │   （每行一个链接：- [Title](file.md) — one-line hook）
  │   成本极低：~50-200 tokens（取决于 memory 数量）
  │
  └── 具体 memory 文件的正文不会自动加载
        │
        ▼
      对话进行中，当系统判断某个 memory 与当前话题相关时：
        → 以 <system-reminder> 形式注入到对话
        → 格式：<system-reminder> 内嵌 "Recalled memories" 块
        → 内容：memory 文件的 frontmatter 摘要 + 正文
```

### 6.4 与 CLAUDE.md/rules 的核心区别

| 维度 | CLAUDE.md / rules | Memory |
|------|-------------------|--------|
| **加载方式** | 无条件全量加载 | 索引常驻 + 正文按需召回 |
| **触发条件** | 会话启动自动 | 语义匹配（对话内容与 memory 相关） |
| **内容粒度** | 可大可小（有截断机制） | 单文件一条事实，极短 |
| **加载时机** | 会话启动时一次性 | 对话中动态注入 |
| **缓存影响** | 修改 → system prompt 变了 → 全量缓存失效 | 修改 → 仅该条 memory 的召回受影响 |
| **适用内容** | 稳定的规则和约束 | 经验教训、用户偏好、项目上下文、外部指针 |
| **Token 成本** | 中等（始终占用） | 极低（索引 ~200 tokens，正文仅召回时加载） |

### 6.5 MEMORY.md 索引格式

```markdown
- [Avoid circular dependency in services](avoid-service-circular-dependency.md) — AI generated circular deps
- [User prefers Chinese interaction](user-prefers-chinese.md) — language preference
- [API docs URL](api-docs-url.md) — reference pointer
```

**注意**：`MEMORY.md` 只有链接列表，不包含 memory 的完整内容。正文仅在召回时注入。

### 6.6 Memory 的四种类型

| type | 用途 | 示例 |
|------|------|------|
| `user` | 用户角色、偏好、习惯 | "用户是后端开发，偏好函数式风格" |
| `feedback` | 用户给出的反馈和纠正 | "用户说代码注释必须用英文" |
| `project` | 项目特定的经验教训 | "UserService 拆分时 AI 生成了循环依赖" |
| `reference` | 外部资源指针 | "API 文档地址、Dashboard URL" |

### 6.7 Memory 之间的关联

Memory 文件正文中可以通过 `[[name]]` 语法关联其他 memory：

```markdown
---
name: avoid-service-circular-dependency
description: AI generated circular dependency between Application layer services
metadata:
  type: project
---

拆分 Service 时，AI 生成了 OrderService → PaymentService → OrderService 的循环依赖。
**Why:** 没有在 CLAUDE.md 中明确禁止 Application 层 Service 之间的直接依赖。
**How to apply:** 在 CLAUDE.md 架构约束中补充禁止规则。参见 [[tech-debt-scan-skill]]。
```

`[[tech-debt-scan-skill]]` 会链接到另一条 memory，即使该 memory 尚不存在也会被标记为"值得创建"。

### 6.8 在 AI Coding 范式中的最佳实践

Memory 最适合放置以下内容：

1. **踩过的坑**：AI 生成的代码中反复出现的错误模式
2. **用户偏好**：交互语言、代码风格例外、工具偏好
3. **外部指针**：API 文档 URL、Dashboard、相关仓库地址
4. **跨会话上下文**：长期项目的阶段性结论

**写入时机**（每次发现以下情况时记录一条）：
- AI 犯了同一个错误 ≥ 2 次 → 写一条 `project` 类型 memory
- 用户纠正了 AI 的某个行为 → 写一条 `feedback` 类型 memory
- 发现了一个有价值的参考资源 → 写一条 `reference` 类型 memory

---

## 七、对话历史与上下文管理

### 6.1 对话累积

每次工具调用（代码读取、编辑、shell 命令等）将 **输入 + 输出** 添加到对话历史中。这是为什么长会话会逐渐消耗上下文的根本原因。

### 6.2 自动压缩（Compaction）

当对话接近上下文窗口上限时：
- 系统自动触发压缩
- 较早的回合被压缩为摘要块
- 最近的上下文保留完整
- 图片在压缩时被保留以维持 prompt cache 复用

### 6.3 上下文预算分配（大致比例）

```
┌─────────────────────────────────────────────┐
│ 总上下文窗口（模型决定，如 200K tokens）       │
│                                             │
│ ┌───────────────────────────────┐           │
│ │ 系统保留（CLAUDE.md + Rules   │ ~5-15%    │
│ │ + Skills 元数据 + System Prompt）│          │
│ ├───────────────────────────────┤           │
│ │ Skill 正文（如已触发）          │ 按需      │
│ ├───────────────────────────────┤           │
│ │ 对话历史                       │ ~70-85%   │
│ │ ┌─────────────────────────┐   │           │
│ │ │ 工具调用 + 结果           │   │           │
│ │ │ 压缩的早期上下文（摘要）    │   │           │
│ │ │ 未压缩的近期上下文（完整）   │   │           │
│ │ └─────────────────────────┘   │           │
│ └───────────────────────────────┘           │
└─────────────────────────────────────────────┘
```

---

## 八、动态上下文注入（`<system-reminder>` 机制）

`<system-reminder>` 是运行时上下文注入机制，**不存储在某个文件中**，而是在三个场景下动态使用。

### 7.1 三条注入路径

| 路径 | 载体 | 触发时机 |
|------|------|---------|
| **Hook 输出** | `additionalContext` JSON 字段 | SessionStart / PreToolUse / PostToolUse |
| **用户消息内嵌** | `<system-reminder>` XML 块 | 用户在聊天框中输入 |
| **Mid-conversation 系统消息** | `role:"system"` 加入 messages 数组 | 代码/API 调用注入 |

#### 路径一：Hook additionalContext（项目已在用）

`hooks/session-start` 脚本输出 JSON：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "当前项目阶段：INIT。严格遵守 HARD-GATE。"
  }
}
```

#### 路径二：用户消息内嵌 `<system-reminder>`

直接在 Claude Code 聊天中输入：

```
<system-reminder>
注意：src/auth/CLAUDE.md 刚刚被外部更新。在处理认证相关问题前先重新读取。
</system-reminder>

请修复登录超时。
```

权重高于普通用户消息，Agent 更倾向于遵守。

#### 路径三：Mid-conversation system 消息（API 层）

通过 API 在 messages 中插入 `role: "system"` 消息，不破坏 prompt cache。

### 7.2 与其他上下文方式对比

| 方式 | 加载时机 | 缓存影响 | 适合 |
|------|---------|---------|------|
| CLAUDE.md | 会话启动，始终 | 修改后全局缓存失效 | 稳定全局约定 |
| SessionStart additionalContext | 会话启动 | 内容变化破坏缓存 | 阶段标记、引导 |
| **`<system-reminder>`** | **按回合，按需** | **不破坏缓存** | **临时提醒、临时约束** |
| Mid-conversation system | 按需，持续生效 | 不破坏缓存 | 模式切换 |

### 7.3 存入哪个文件？

**`<system-reminder>` 不存入文件**。它本质是对话中的临时消息。

如果需要一个可复用的模板文件：

```
.claude/
└── templates/
    └── reminders.md    ← 常用模板（手动复制使用）
```

```markdown
# 常用提醒模板

## 模块切换
<system-reminder>
你当前工作在 src/auth/。该模块使用 JWT，API 为 REST。
修改前先读 src/auth/CLAUDE.md。
</system-reminder>

## 跨模块修改
<system-reminder>
本次涉及 src/auth/ 和 src/payment/。先分别读其 CLAUDE.md。
</system-reminder>

## 上下文紧张
<system-reminder>
上下文接近上限。精简回答，不要做不必要的文件读取。
如需更多上下文，先列出最关键的 3 个信息缺口。
</system-reminder>
```

---

## 九、完整加载时序

```
1. Claude Code 进程启动
   ├── 读取 settings.json（所有级别，合并配置）
   ├── 确定工作目录
   └── 解析项目根目录

2. Layer 1 加载（静态指令，同步）
   ├── 加载 ~/.claude/CLAUDE.md
   ├── 从工作目录向上遍历，加载所有 CLAUDE.md
   ├── 加载 .claude/rules/*.md
   ├── 按优先级排序拼接
   ├── 超出长度限制则截断（低优先级先截）
   └── 包装后注入系统提示

3. Layer 2 触发（SessionStart Hook，同步/异步）
   ├── 匹配 matcher（startup/clear/compact）
   ├── 执行 command hook 或 prompt hook
   └── additionalContext 注入系统提示

4. Layer 3 注册（Skills 元数据，同步）
   ├── 扫描所有 skills/ 目录
   ├── 提取所有 SKILL.md 的 name + description
   └── Skills 元数据加入系统提示（始终在上下文）

5. Memory 索引加载（MEMORY.md，同步）
   ├── 读取 memory/MEMORY.md 索引文件
   ├── 仅加载标题行列表（~50-200 tokens）
   └── 具体 memory 正文不在此阶段加载

6. 等待用户输入
   ├── 用户发送消息
   ├── Agent 检查 Skills description → 决定是否调用 Skill 工具
   │   └── 若是：加载 SKILL.md 正文（Layer 3 正文层）
   ├── 系统检查 Memory 索引 → 匹配到相关的 memory？
   │   └── 若是：以 <system-reminder> 注入 memory 正文
   └── Agent 执行任务，累积对话历史（Layer 5）
```

### 子代理（Sub-agent）的特殊性

子代理也遵循相同的加载机制，但有以下差异：
- 子代理**继承**父代理的 CLAUDE.md 上下文
- 子代理可以有自己的工作目录，加载该目录的 CLAUDE.md
- 许多 harness（如 Superpowers 的 `<SUBAGENT-STOP>` 标记）会跳过子代理的引导指令
- GSD 采用 "fresh context per task" 策略，每个子代理获得干净上下文

---

## 十、Prompt Caching 对上下文设计的影响

### 10.1 渲染顺序

API 层面的渲染顺序：`tools → system → messages`

### 10.2 缓存失效规则

| 操作 | 缓存影响 |
|---|---|
| 修改 CLAUDE.md 内容 | system prompt 改变 → 全部缓存失效 |
| 修改 .claude/rules/ | system prompt 改变 → 全部缓存失效 |
| 添加/删除/reorder Skills | tool definitions 改变 → 全部缓存失效 |
| SessionStart Hook 输出变化 | system prompt 改变 → 全部缓存失效 |
| 修改 Memory 文件 | 仅影响该条 memory 的召回（不影响缓存） |
| 仅修改对话内容 | 仅 messages 部分缓存失效（之前的缓存保留） |

### 10.3 实践启示

1. **CLAUDE.md 放最稳定内容**：不要在其中放"今日日期"或"当前 Sprint 编号"等动态信息
2. **动态上下文通过对话注入**：用 `<system-reminder>` 在用户消息中注入动态信息
3. **Skills description 应稳定**：频繁修改 description 会导致每次启动缓存失效
4. **SessionStart 输出避免时间戳**：如果注入的内容包含 `date` 输出，每次会话都破坏缓存
5. **Memory 是最"安全"的修改**：增删改 Memory 文件不影响 system prompt 缓存，可高频更新

---

## 十一、四大 Harness 项目的上下文策略对比

| 维度 | OpenSpec | Superpowers | GSD | Matt Pocock |
|------|----------|-------------|-----|-------------|
| **CLAUDE.md** | 不生成，全部走 Skill | Agent 指令引用 | hooks 自管理 | 领域知识 + Skill 注册 |
| **SessionStart** | 不使用 | ★★★★★ 核心机制 | hooks 管理 | 不使用 |
| **Skills 触发方式** | Slash 命令手动 | SessionStart 引导自动触发 | Slash 命令 + Capability 描述符 | Slash 命令手动 |
| **上下文隔离** | 变更目录自包含 | git worktree 隔离 | fresh-context per task | 依赖显式引用 |
| **规则组织** | Schema.yaml | SKILL.md + references | CONTEXT.md + 规则 | CLAUDE.md + CONTEXT.md |
| **Token 优化** | 50KB 限制 + CLI 查询 | 按需加载 Skill | 92% 削减（两级路由） | 100行上限 + caveman |
| **Memory 机制** | 不使用 | 不使用 | 不使用 | 不使用 |

### 各项目独特优势

- **Superpowers**：SessionStart + using-superpowers 引导 = 最强的 Skill 自动发现
- **GSD**：两级命名空间路由 + fresh context = 最极致的 Token 优化
- **OpenSpec**：编译时生成 Skill + Artifact DAG = 最强的一致性保证
- **Matt Pocock**：单文件 < 100 行 + CONTEXT.md 领域语言 = 最低学习成本

---

## 十二、团队规范设计框架

基于以上机制分析，团队规范的文件组织建议：

```
项目根目录/
├── CLAUDE.md                    ← 核心约定（代码风格、技术栈、工作流指引）
├── .claude/
│   ├── rules/                   ← 拆分后的详细规则
│   │   ├── coding-style.md
│   │   ├── testing.md
│   │   ├── git-workflow.md
│   │   └── error-handling.md
│   ├── settings.json            ← 项目级 Hook 和权限配置
│   ├── settings.local.json      ← 个人覆盖（不提交 git）
│   └── skills/                  ← 项目特定 Skills
│       ├── code-review/
│       │   └── SKILL.md
│       └── ...
└── CONTEXT.md                   ← 领域术语定义（可选）
```

### 内容分层原则

| 层级 | 放什么 | 稳定性 | 示例 |
|---|---|---|---|
| CLAUDE.md | 最核心、最稳定的约定 | 极稳定 | "使用函数式编程"、"纯函数不修改入参" |
| .claude/rules/ | 详细但稳定的规则 | 稳定 | 代码示例、lint 配置、命名约定 |
| SessionStart Hook | 动态上下文 | 每会话可变 | 当前 Sprint 目标、项目阶段标记 |
| Skills | 特定任务的流程 | 中等稳定 | TDD 流程、Code Review 流程 |
| CONTEXT.md | 领域术语定义 | 稳定 | "Issue Tracker 指 GitHub Issues" |
| Memory | 经验教训、偏好、外部指针 | 索引常驻+正文按需召回 | 中 | AI踩过的坑、用户偏好、API文档URL |

### 两阶段内容策略

**阶段一：新项目初始化**
```
CLAUDE.md 重点：
  - 代码风格约定（不可变性、纯函数、文件大小限制）
  - 架构决策（技术栈、目录结构、模块划分）
  - ADR 记录规范
  - Skill 使用策略（"开始任何功能前先用 brainstorming"）

SessionStart Hook：
  - 注入：项目阶段 = INIT
  - 注入：当前架构文档位置指针
  - 注入：流程强制执行提示（借鉴 Superpowers HARD-GATE 思路）

Workspace Skills：
  - brainstorming（来自 Superpowers）
  - writing-plans（来自 Superpowers）
  - subagent-driven-development（来自 Superpowers）
```

**阶段二：敏捷迭代**
```
CLAUDE.md 重点：
  - 继承阶段一的代码风格（不重复写）
  - Issue 管理约定（/triage 标签定义）
  - 快速反馈循环规则（/diagnose → /tdd → review）
  - Sub-agent 使用规则和限制

SessionStart Hook：
  - 注入：项目阶段 = AGILE
  - 注入：当前 Sprint 上下文
  - 降低流程强制力（敏捷追求速度）

Workspace Skills：
  - diagnose（来自 Matt Pocock）
  - tdd（来自 Matt Pocock）
  - triage（来自 Matt Pocock）
  - code-review（来自 Matt Pocock）
```
