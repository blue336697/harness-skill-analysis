# Matt Pocock Skills 分析报告

> **仓库**: [mattpocock/skills](https://github.com/mattpocock/skills) | 129K+ Stars | MIT License
> **定位**: 实战工程技能集 — "Real Engineering, not vibe coding"

## 核心理念

反对"vibe coding"（玄学编程）和重流程方法论，回归软件工程四大基本功：

| 问题 | 对应 Skill | 经典著作 |
|------|-----------|---------|
| 需求理解偏差 | `/grill-me` / `/grill-with-docs` | The Pragmatic Programmer |
| Agent 过度冗长 | `CONTEXT.md` 领域语言 | Domain-Driven Design |
| 代码质量无保障 | `/tdd` + `/diagnose` | The Pragmatic Programmer |
| 架构腐化 | `/improve-codebase-architecture` | Philosophy Of Software Design |

## 差异化特点

| 维度 | Matt Pocock | OpenSpec/Superpowers/GSD |
|------|------------|--------------------------|
| 哲学 | 小、独立、可组合 | 大框架、重流程 |
| 模型绑定 | 模型无关 | 通常绑定特定模型 |
| 配置化 | 一次 setup | 需更多基础设施 |
| 领域驱动 | CONTEXT.md 共享语言核心 | 通常不强调 |

## Skill 结构

### 分类体系
```
skills/
├── engineering/     # 9个日常编码技能
│   ├── diagnose/    # 六步诊断循环 ★核心
│   ├── tdd/         # RED-GREEN-REFACTOR
│   ├── triage/      # Issue 状态机
│   ├── to-issues/   # 垂直切片拆分
│   ├── to-prd/      # PRD 生成
│   ├── grill-with-docs/
│   ├── improve-codebase-architecture/
│   ├── prototype/
│   ├── setup-matt-pocock-skills/
│   └── zoom-out/
├── productivity/    # 5个非编码工作流
├── misc/            # 4个工具
├── personal/        # 个人专用(不对外)
├── in-progress/     # 草稿中
└── deprecated/      # 已废弃
```

### SKILL.md 格式
- YAML frontmatter: name, description (≤1024字符), argument-hint, disable-model-invocation
- 正文 ≤100行，超出拆分到 REFERENCE.md
- 渐进式披露: Quick start → Workflows → Advanced

## 核心 Skills

### `/diagnose` — 六步诊断循环
Phase 1: 构建反馈循环 → Phase 2: 复现 → Phase 3: 假设 → Phase 4: 仪器化 → Phase 5: 修复+回归 → Phase 6: 清理+事后分析
核心原则: "反馈循环是一切；没有快速 pass/fail 信号，后面都是空谈"

### `/tdd` — 垂直切片
核心反模式: 水平切片（一次写5个测试，再一次实现5个）
正确方式: 每次一个 RED→GREEN→REFACTOR 循环

### `/triage` — Issue 状态机
7种角色: bug/enhancement + needs-triage/needs-info/ready-for-agent/ready-for-human/wontfix

### `/to-issues` — 垂直切片拆分
每 issue 是一个 thin vertical slice，偏好多个薄切片 > 少数厚切片

## 上下文工程

### CONTEXT.md — 共享领域语言
- Language: 精确术语定义
- Relationships: 实体关系
- Flagged ambiguities: 历史歧义记录
- 规则: Opinionated, Tight definitions, 无实现细节

### ADR — 轻量架构决策
三条创建条件: 难以撤销 + 脱离上下文会惊讶 + 经过真正的权衡

### Token 优化
- caveman 模式压缩 75%
- SKILL.md 100行上限
- 确定性操作用脚本替代指令
- description 缩减策略

## 质量保障
- **git-guardrails**: PreToolUse Hook 拦截 push/reset --hard/clean -f/branch -D
- **setup-pre-commit**: Husky + lint-staged + Prettier + typecheck + test
