# Harness Skill Analysis — 文档索引

```
docs/
├── README.md                          # 本文件：文档索引
├── project-init-guide.md              # 项目初始化操作指南
│
├── research/                          # 研究分析
│   ├── open-source-agents.md          # 开源 AI Coding Agent 调研
│   └── claude-code-context.md         # Claude Code 上下文机制分析
│
├── design/                            # 设计方案
│   ├── claude-md-hierarchical-design.md  # CLAUDE.md 层次化设计
│   ├── skills-combination-plan.md        # Skills 组合方案
│   └── team-conventions.md               # 团队 Claude Code 协作约定
│
├── comparison/                        # 四项目对比分析
│   ├── README.md                      # 对比分析入口
│   ├── overview.md                    # 对比总览
│   ├── 01-workflow-model.md           # 工作流模型对比
│   ├── 02-skill-design.md             # Skill 设计对比
│   ├── 03-context-engineering.md      # 上下文工程对比
│   ├── 04-quality-assurance.md        # 质量保障对比
│   ├── 05-agent-orchestration.md      # Agent 编排对比
│   ├── 06-cross-platform.md           # 跨平台支持对比
│   └── 07-security.md                 # 安全机制对比
│
└── paradigm/                          # AI Coding 范式（基于美团实践）
    ├── README.md                      # 范式概述与设计理念
    ├── paradigm-init.md               # ★ AI 自举指令（给AI看的）
    ├── harness-usage-guide.md         # ★ 日常使用手册（给人看的）
    ├── templates/                     # 项目文件模板
    └── skills/                        # 4个自定义 Skill 定义
```

## 按场景导航

| 我想... | 看这个 |
|---------|--------|
| 初始化项目，AI 搭建 AI Coding 基础设施 | [paradigm/README.md](paradigm/README.md) → [paradigm-init.md](paradigm/paradigm-init.md) |
| 日常 AI Coding，查命令怎么用 | [paradigm/harness-usage-guide.md](paradigm/harness-usage-guide.md) |
| 了解四个 Harness 项目的设计差异 | [comparison/README.md](comparison/README.md) |
| 了解为何组合 Superpowers + Matt Pocock | [design/skills-combination-plan.md](design/skills-combination-plan.md) |
| 了解团队协作的 Git/CR/Agent 规范 | [design/team-conventions.md](design/team-conventions.md) |
| 了解 CLAUDE.md 的层次化设计思路 | [design/claude-md-hierarchical-design.md](design/claude-md-hierarchical-design.md) |
| 了解开源 AI Coding Agent 生态 | [research/open-source-agents.md](research/open-source-agents.md) |

## 按角色导航

| 我是... | 优先读 |
|---------|--------|
| 新加入团队的开发 | 1. [使用手册](paradigm/harness-usage-guide.md) 2. [团队约定](design/team-conventions.md) |
| 主R/核心开发 | 1. [范式全貌](paradigm/README.md) 2. [选型理由](design/skills-combination-plan.md) |
| Tech Lead/架构师 | 1. [横向对比](comparison/README.md) 2. [范式设计](paradigm/README.md) |
| 研究者/调研者 | 1. [生态调研](research/open-source-agents.md) 2. [深入对比](comparison/) |
