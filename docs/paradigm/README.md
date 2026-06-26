# AI Coding 范式 — 基于美团实践 + Claude Code 的团队工程规范

> 将美团 AI Coding 方法论（31万行代码的渐进式治理 + 单元测试协同进化）翻译为 Claude Code 原生机制的可执行范式。

## 一句话说明

在 Claude Code 中说一句话，AI 自动完成项目 80% 的 AI Coding 基础设施初始化。剩余 20% 是团队共识，由人类在会议中填入。

## 设计理念

美团两篇文章讲了"做什么"但没讲"怎么做"。本项目将方法论翻译为 Claude Code 的 5 层原生机制：

| 美团概念 | Claude Code 映射 | 本范式文件 |
|---------|-----------------|-----------|
| AI Rule（always级别） | `CLAUDE.md` + `.claude/rules/` | `templates/` 目录 |
| Skill（渐进式加载） | `/skill` 机制 | `skills/` 目录 |
| Pre-PR AI 自查 | `/pre-pr-check` Skill | `skills/pre-pr-check/SKILL.md` |
| 多模型对抗审核 | sub-agent 多 model 参数 | `skills/multi-model-review/SKILL.md` |
| 技术债穷举扫描 | `/tech-debt-scan` Skill | `skills/tech-debt-scan/SKILL.md` |
| 主R打样→SOP→并行 | `/sop-from-master` Skill | `skills/sop-from-master/SKILL.md` |

**不构建自定义 Harness**。Claude Code 原生的 Skills + Rules + Hooks 已经图灵完备。自定义 Harness（如 OpenSpec 的 CLI 工具）只在需要跨工具兼容时有价值。

## 文件结构

```
docs/paradigm/
├── README.md                         # 本文件：概述和使用说明
├── paradigm-init.md                  # ★ 核心：AI 自举指令（给 AI 看的）
├── templates/                        # 项目文件模板（含 {{PLACEHOLDER}}）
│   ├── CLAUDE.md.tmpl
│   ├── CONTEXT.md.tmpl
│   ├── tech-debt.md.tmpl
│   └── rules/
│       ├── architecture.md.tmpl
│       └── coding-standards.md.tmpl
└── skills/                           # 4 个自定义 Skill（直接复制到目标项目）
    ├── pre-pr-check/SKILL.md
    ├── tech-debt-scan/SKILL.md
    ├── multi-model-review/SKILL.md
    └── sop-from-master/SKILL.md
```

> 📖 **团队日常使用手册**: [harness-usage-guide.md](harness-usage-guide.md) — 场景速查、Skill详解、角色分工、常见问题。

## 使用方式

### 初始化一个项目

在 Claude Code 中打开目标项目，说：

```
请阅读 D:/claudeProjects/harness-skill-analysis/docs/paradigm/paradigm-init.md，
按照文档中的 Phase 0-4 执行项目初始化。遇到 [HUMAN-NEEDED] 标记时停下来等我输入。
```

AI 将自动执行：
1. **Phase 0**: 检测项目技术栈、代码规模、现有分层
2. **Phase 1**: 创建 `.claude/rules/`、`.claude/skills/`、`docs/adr/` 等目录
3. **Phase 2**: 安装 4 个自定义 Skill
4. **Phase 3**: 深度分析代码库——提取候选术语、识别架构反模式、检测编码风格
5. **Phase 4**: 生成 CLAUDE.md、CONTEXT.md、tech-debt.md 等文件（AI 预填充 + 人类待填标记）

然后 AI 停下来，输出一份**共识会议议程**，等待团队开会。

### 团队开会补充共识

团队按 AI 生成的议程开会（预计 2-3 小时），对架构分层、编码规范、领域术语、技术债优先级、工作流约定达成共识。会议结束后告诉 AI 结论，AI 自动写入约束文件。

### 日常使用

| 场景 | 命令 | 效果 |
|------|------|------|
| 提交 PR 前 | `/pre-pr-check` | 6 维度 AI 自查 → 过滤低级问题 → 生成 PR 文档 |
| 技术债盘点 | `/tech-debt-scan` | AI 穷举扫描 → 自动分级 → 输出债务清单 |
| 重要 PR 审查 | `/multi-model-review` | 3 个不同模型并行审查 → 交叉验证 → 合并报告 |
| 主R完成后 | `/sop-from-master` | 从 git history 提取模式 → 生成可复用 SOP |

## 5 层架构

```
第5层：度量层 → cost-report、质量趋势、技术债变化（反馈闭环）
第4层：知识层 → CONTEXT.md、ADR、Memory、.claude/rules/（跨会话持久化）
第3层：质量门禁 → Pre-PR Hook、多模型对抗、测试基线检查（自动化执法）
第2层：流程层 → /pre-pr-check、/tech-debt-scan、/multi-model-review、/sop-from-master
第1层：约束层 → CLAUDE.md、编码规范、分层架构、领域模型（Always 加载）
```

## 与现有 Skills 组合方案的关系

本范式新增的 4 个 Skill 是对现有 [Skills 组合方案](../design/skills-combination-plan.md) 的补充——填补了美团方法论中特有的 4 个能力缺口：

| 缺口 | 本范式 Skill | 为什么现有方案没有 |
|------|-------------|------------------|
| Pre-PR 自查 | `/pre-pr-check` | Superpowers/Matt Pocock 的 code-review 是审查已有代码，不是"提交前的自查清单" |
| 多模型对抗 | `/multi-model-review` | 四个 Harness 项目都没有多模型交叉验证的设计 |
| 技术债管理 | `/tech-debt-scan` | GSD 有健康检查但太重，需要安装运行时 |
| SOP 生成 | `/sop-from-master` | 美团独有模式，四个项目都没有 |

## 关键风险

1. **不要一次性上所有 Skill**。先上 `pre-pr-check` + `tech-debt-scan`，用两周再考虑加其他。
2. **AI Rule 宁少勿多**。起步 3-5 条，Rule 越多 AI 遵守精确度越低。
3. **必须有"独裁者"**。1 个核心开发负责最终拍板架构和规范决策。
4. **SOP 是消耗品**。代码演进后 SO会过期，不需要长期维护。重点维护 ADR。

## 参考来源

- [美团 AI 重构实践：31 万行代码的渐进式治理](https://tech.meituan.com/2026/05/07/Agent-AI-Coding.html)
- [美团 AI Coding 与单元测试协同进化](https://tech.meituan.com/2025/12/05/AI-Coding-Unit-Testing.html)
- [四项目对比分析](../comparison/overview.md)
- [Skills 组合方案](../design/skills-combination-plan.md)
- [团队 Claude Code 协作开发约定](../design/team-conventions.md)
