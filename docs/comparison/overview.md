# 四项目对比分析

> 分析日期: 2026-06-15

## 总览

| 维度 | OpenSpec | Superpowers | GSD | Matt Pocock |
|------|----------|-------------|-----|-------------|
| **GitHub** | Fission-AI/OpenSpec | obra/superpowers | open-gsd/gsd-core | mattpocock/skills |
| **Stars** | 53K+ | 228K+ | 4K+ | 129K+ |
| **定位** | SDD规约驱动 | 完整软件方法论 | 上下文工程框架 | 实战工程技能集 |
| **哲学** | 先对齐再构建 | 流程强制+心理学 | 编排+上下文优化 | 小、独立、可组合 |
| **复杂度** | ★★★☆ | ★★★★ | ★★★★★ | ★★☆☆ |
| **运行时支持** | 25+ | 8+ | 17+ | Claude Code为主 |

## 工作流模型对比

| 维度 | OpenSpec | Superpowers | GSD | Matt Pocock |
|------|----------|-------------|-----|-------------|
| **工作流** | propose→explore→apply→archive | brainstorming→plan→TDD→review | Discuss→Plan→Execute→Verify→Ship | 离散技能，自由组合 |
| **状态管理** | 文件系统(Artifact DAG) | Git commits + TodoWrite | STATE.md + .planning/ | Issue Tracker |
| **Agent调度** | 主对话Agent(无sub-agent) | 逐任务sub-agent+两级review | 波内并行/波间串行 | 有限Explore agent |
| **上下文隔离** | 变更目录自包含 | git worktree隔离 | fresh-context per task | 依赖显式引用 |

## Skill/命令设计对比

| 维度 | OpenSpec | Superpowers | GSD | Matt Pocock |
|------|----------|-------------|-----|-------------|
| **Skill数量** | 11(动态生成) | 16 | 69命令+34agent | 22(分6类) |
| **格式** | TypeScript模板→SKILL.md | SKILL.md(YAML+Markdown) | Markdown(YAML前置) | SKILL.md(YAML+Markdown) |
| **触发方式** | Slash命令 | SessionStart自动检测 | Slash命令 | Slash命令(用户主动) |
| **可扩展性** | Schema.yaml自定义 | writing-skills TDD方法论 | Capability JSON描述符 | write-a-skill脚手架 |
| **复杂度** | 中(模板+CLI双重) | 高(HARD-GATE等) | 极高(两级路由) | 低(单文件≤100行) |

## 上下文工程对比

| 维度 | OpenSpec | Superpowers | GSD | Matt Pocock |
|------|----------|-------------|-----|-------------|
| **注入策略** | 编译时Skill+运行时CLI JSON | SessionStart Hook注入 | 工作流→context负载 | 用户主动调用 |
| **CLAUDE.md** | 不生成 | Agent指令引用 | hooks自管理 | 领域知识+Skill注册 |
| **领域模型** | config.yaml (context+rules) | 无 | CONTEXT.md (8 XML块) | CONTEXT.md (术语表) |
| **Token优化** | 50KB限制+结构化CLI查询 | 按需加载Skill | 92%削减(两级路由+fresh context) | 100行上限+caveman压缩 |

## 质量保障对比

| 维度 | OpenSpec | Superpowers | GSD | Matt Pocock |
|------|----------|-------------|-----|-------------|
| **验证机制** | 4层(CLI→AI→Delta→归档) | HARD-GATE+6层TDD防御 | 对抗性验证(goal-backward) | TDD+diagnose循环 |
| **Review** | Spec artifacts审查 | 两级(spec+quality) | plan-checker(3轮)+verifier | code-review checklist |
| **安全防护** | 操作前验证pass | Cialdini说服原则 | Prompt注入扫描+Slopcheck | git-guardrails Hook |
| **恢复能力** | 删除change目录/原子性spec | 重新从TDD开始 | 完整检查点+原子提交 | 依赖外部工具 |
| **强制力** | 低(依赖Agent自律) | 极高(心理学+流程多重防御) | 高(hooks+门控) | 低(信任用户判断) |

## 核心创新

| 项目 | 最独特的设计 |
|------|------------|
| **OpenSpec** | Artifact DAG+Kahn拓扑排序，25+工具统一适配，Schema驱动工作流引擎 |
| **Superpowers** | HARD-GATE+理性化表格+Red Flags的多层心理强制，Skill本身的TDD方法论 |
| **GSD** | 两级命名空间路由(92% token削减)，Capability描述符系统，波分析并行执行 |
| **Matt Pocock** | CONTEXT.md领域语言+Dreyfus模型教学，诊断循环的10级反馈循环优先级 |

## 适用场景建议

| 场景 | 推荐 | 理由 |
|------|------|------|
| 新项目从零开始 | Superpowers 或 GSD | 完整方法论覆盖全流程 |
| 存量项目迭代 | OpenSpec | Delta-spec brownfield-first |
| 个人开发者 | Matt Pocock | 轻量、灵活、学习成本低 |
| 大团队协作 | OpenSpec | 25+工具兼容，artifact标准化 |
| 长周期项目 | GSD | 上下文工程+断点恢复 |
| 安全敏感项目 | GSD + Superpowers | Token注入防御+TDD强制 |
| 快速原型 | Matt Pocock | caveman模式+prototype skill |
