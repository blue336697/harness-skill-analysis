# 新项目初始化指南

> 按本指南操作，10 分钟完成新项目 Claude Code Harness 初始化。

## 一、初始化后的完整目录结构

```
<新项目>/
├── CLAUDE.md                          ← 根 CLAUDE.md（项目总纲）
├── CONTEXT.md                         ← 领域语言（可选，有领域术语时创建）
├── .claude/
│   ├── .phase                         ← 阶段标记（内容：INIT）
│   ├── settings.json                  ← Hook 和权限配置
│   ├── rules/                         ← 交叉性规则（自动加载）
│   │   ├── coding-style.md
│   │   ├── error-handling.md
│   │   └── testing.md
│   ├── skills/                        ← 阶段一 Skills
│   │   ├── using-superpowers/SKILL.md
│   │   ├── brainstorming/SKILL.md
│   │   ├── writing-plans/SKILL.md
│   │   ├── subagent-driven-development/SKILL.md
│   │   ├── test-driven-development/SKILL.md
│   │   ├── requesting-code-review/SKILL.md
│   │   ├── using-git-worktrees/SKILL.md
│   │   └── git-guardrails-claude-code/SKILL.md
│   └── hooks/
│       ├── hooks.json                ← SessionStart Hook 配置
│       └── session-start             ← 引导注入脚本
├── src/
│   └── .gitkeep
├── docs/
│   ├── adr/                          ← 架构决策记录
│   └── superpowers/
│       ├── specs/                    ← brainstorming 设计文档产出
│       └── plans/                    ← writing-plans 实施计划产出
└── .gitignore
```

## 二、初始化步骤

### 步骤 1：创建目录

```bash
mkdir -p .claude/{rules,skills,hooks}
mkdir -p docs/{adr,superpowers/{specs,plans}}
mkdir -p src
echo "INIT" > .claude/.phase
```

### 步骤 2：复制 Skills

```bash
REPOS="D:/claudeProjects/harness-skill-analysis/repos"

# Superpowers（阶段一核心）
cp -r "$REPOS/superpowers/skills/using-superpowers" .claude/skills/
cp -r "$REPOS/superpowers/skills/brainstorming" .claude/skills/
cp -r "$REPOS/superpowers/skills/writing-plans" .claude/skills/
cp -r "$REPOS/superpowers/skills/subagent-driven-development" .claude/skills/
cp -r "$REPOS/superpowers/skills/test-driven-development" .claude/skills/
cp -r "$REPOS/superpowers/skills/requesting-code-review" .claude/skills/
cp -r "$REPOS/superpowers/skills/using-git-worktrees" .claude/skills/

# Matt Pocock（安全防护）
cp -r "$REPOS/mattpocock/skills/misc/git-guardrails-claude-code" .claude/skills/
```

### 步骤 3：创建 SessionStart Hook

**`.claude/hooks/hooks.json`**：

```json
{
  "SessionStart": [
    {
      "matcher": "startup|clear|compact",
      "hooks": [
        {
          "type": "command",
          "command": "bash \"${CLAUDE_PLUGIN_ROOT}/.claude/hooks/session-start\"",
          "async": false
        }
      ]
    }
  ]
}
```

**`.claude/hooks/session-start`**（保存后执行 `chmod +x .claude/hooks/session-start`）：

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BOOTSTRAP="${PLUGIN_ROOT}/.claude/skills/using-superpowers/SKILL.md"

PHASE="INIT"
[ -f "${PLUGIN_ROOT}/.claude/.phase" ] && PHASE=$(cat "${PLUGIN_ROOT}/.claude/.phase")

bootstrap_content=$(cat "$BOOTSTRAP" 2>/dev/null || echo "")

escape_for_json() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\r'/\\r}"
    s="${s//$'\t'/\\t}"
    printf '%s' "$s"
}

escaped_bootstrap=$(escape_for_json "$bootstrap_content")
context="<EXTREMELY-IMPORTANT>\nCurrent project phase: ${PHASE}\n\n${escaped_bootstrap}\n</EXTREMELY-IMPORTANT>"
escaped_context=$(escape_for_json "$context")

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}' "$escaped_context"
exit 0
```

### 步骤 4：创建 `.claude/settings.json`

```json
{
  "permissions": {
    "allow": [
      "Bash(npm: *)", "Bash(pnpm: *)", "Bash(yarn: *)",
      "Bash(git diff: *)", "Bash(git log: *)", "Bash(git status: *)",
      "Bash(git add: *)", "Bash(git commit: *)",
      "Bash(git branch: *)", "Bash(git checkout: *)",
      "Bash(npx vitest: *)", "Bash(npx jest: *)",
      "Bash(cargo test: *)", "Bash(go test: *)",
      "Read", "Write", "Edit", "Glob", "Grep"
    ],
    "ask": [
      "Bash(git push: *)",
      "Bash(npm install: *)", "Bash(pnpm add: *)", "Bash(yarn add: *)",
      "Bash(cargo add: *)", "Bash(go get: *)"
    ],
    "deny": [
      "Bash(git push --force: *)",
      "Bash(git reset --hard: *)",
      "Bash(git branch -D: *)",
      "Bash(rm -rf: *)",
      "Bash(sudo: *)"
    ]
  }
}
```

### 步骤 5：创建根 CLAUDE.md

```markdown
# [PROJECT_NAME]

## 项目概述
- 项目目标：[一句话描述]
- 技术栈：[语言] + [框架] + [数据库]
- 仓库结构：

[PROJECT_NAME]/
├── src/            → [核心代码]
├── docs/           → 文档
│   ├── adr/        → 架构决策记录
│   └── superpowers/→ 设计文档和实施计划
└── .claude/        → Claude Code 配置

## 索引：子级 CLAUDE.md

| 目录 | CLAUDE.md | 适用场景 |
|------|-----------|---------|
| src/ | src/CLAUDE.md（待创建） | [后端/核心开发] |

## 全局原则

### 代码风格
- [原则 1]
- [原则 2]

### 错误处理
- 始终显式抛出，禁止静默吞掉
- 错误信息必须包含调试上下文

### 文件组织
- 单文件不超过 500 行
- 按功能而非类型组织目录

## 架构决策

> 阶段一（INIT）：项目核心决策。阶段二可归档到 docs/adr/。

| ADR | 决策 | 原因 |
|-----|------|------|
| [ADR-001] | [决策] | [理由] |

## 环境与工具
- [运行时] >= [版本]
- 包管理器：[名称]

## 工作流约定

### Agent 行为规则
- 每次修改代码后使用 /code-review
- 开始任何功能前使用 /brainstorming
- 禁止在未批准设计的情况下写代码（HARD-GATE）

### Git 约定
- Commit 格式：`<type>: <描述>`
- 分支命名：`feature/` `fix/` `refactor/` `chore/`

### Skill 使用策略
收到任务后必须先检查 Skills。即使 1% 可能适用也必须调用 Skill 工具。
流程 Skill 优先于实现 Skill。
```

### 步骤 6：创建 `.claude/rules/` 规则文件

**`.claude/rules/coding-style.md`**：

```markdown
# 代码风格

## 不可变性
始终创建新对象，绝不修改现有对象。
优先使用函数式编程，纯函数不修改入参或全局状态。

## 文件组织
- 单文件 200-400 行，最多 800 行
- 按功能/领域组织目录，而非按类型
- 高内聚低耦合

## 函数设计
- 单一职责，不超过 50 行
- 禁止标志参数切换逻辑
- 所有参数显式声明（禁止默认参数值）

## 类型标注
- 所有地方严格类型标注：返回值、变量、参数
- 禁止 Any/unknown 泛型滥用
```

**`.claude/rules/error-handling.md`**：

```markdown
# 错误处理

## 原则
- 始终显式抛出，绝不静默吞掉
- 使用具体错误类型，表明问题根源
- 禁止通用异常捕获掩盖根因

## 错误信息
- 清晰、可操作
- 包含调试上下文：请求参数、响应体、状态码
- 日志使用结构化字段，禁止字符串拼接

## 外部调用
- 带警告的重试机制
- 重试失败后抛出最后一次错误
- 不添加回退逻辑（除非明确要求）
```

**`.claude/rules/testing.md`**：

```markdown
# 测试规范

## 策略
- 优先集成测试、端到端测试
- 单元测试仅用于稳定数据和纯转换逻辑
- 不单纯为覆盖率添加测试

## TDD 循环（阶段一强制，阶段二推荐）
- RED: 先写失败测试
- GREEN: 最小实现使其通过
- REFACTOR: 改进代码结构

## 禁止
- Mock 外部服务（优先调用真实接口）
- 测试实现细节（测试行为，通过公共接口）
```

### 步骤 7：创建 `.gitignore`

```gitignore
# Claude Code 本地配置
.claude/settings.local.json

# OS
.DS_Store
Thumbs.db

# 项目构建产物（添加你的语言特定项）
node_modules/
__pycache__/
target/
```

### 步骤 8：验证

```bash
# 在项目根目录启动 Claude Code，然后问：
"你加载了哪些项目约定？列出所有 CLAUDE.md、rules 和 Skills。"

# 预期 Agent 回答包含：
# ✓ 根 CLAUDE.md（全局原则、架构决策、工作流约定）
# ✓ .claude/rules/coding-style.md
# ✓ .claude/rules/error-handling.md
# ✓ .claude/rules/testing.md
# ✓ Skills 元数据：using-superpowers, brainstorming, writing-plans,
#   subagent-driven-development, test-driven-development, 
#   requesting-code-review, using-git-worktrees, git-guardrails
# ✓ SessionStart 注入：using-superpowers 引导 + 阶段标记 INIT
```

## 三、初始化后的第一个任务

用 brainstorming 定义项目架构：

```bash
/brainstorming
```

Agent 将执行 9 步流程：
1. 探索项目上下文（检测技术栈、目录结构）
2. 视觉辅助（如涉及 UI）
3. 逐次提问（项目目标、约束、成功标准）
4. 提出 2-3 个架构方案
5. 呈现设计 → 等待批准
6. 写设计文档到 `docs/superpowers/specs/`
7. 自审
8. 用户审阅 spec 文件
9. 转 writing-plans

此后你的项目就有了：
- `docs/superpowers/specs/<日期>-<架构>-design.md`
- 根 CLAUDE.md 的架构决策部分被实际填充
- 可以创建 `src/CLAUDE.md` 根据设计文档

## 四、后续维护

### 添加新模块

```bash
mkdir -p src/<module>
# 创建 src/<module>/CLAUDE.md（参照 docs/design/claude-md-hierarchical-design.md 模块层模板）
# 更新根 CLAUDE.md 的"索引：子级 CLAUDE.md"表格
```

### 切换到阶段二

```bash
echo "AGILE" > .claude/.phase

# 移除阶段一重流程 Skills
rm -rf .claude/skills/brainstorming
rm -rf .claude/skills/writing-plans
rm -rf .claude/skills/subagent-driven-development
rm -rf .claude/skills/using-git-worktrees

# 安装阶段二 Skills
REPOS="D:/claudeProjects/harness-skill-analysis/repos"
cp -r "$REPOS/mattpocock/skills/engineering/diagnose" .claude/skills/
cp -r "$REPOS/mattpocock/skills/engineering/tdd" .claude/skills/
cp -r "$REPOS/mattpocock/skills/engineering/triage" .claude/skills/
cp -r "$REPOS/mattpocock/skills/engineering/to-issues" .claude/skills/

# 更新根 CLAUDE.md：移除 HARD-GATE，添加敏捷规则
```

### 添加自定义 Skill

```bash
mkdir -p .claude/skills/<skill-name>
# 创建 SKILL.md（至少含 name + description frontmatter）
# 在根 CLAUDE.md 的 Skill 策略中注册
```
