# Harness Skill Analysis

分析主流 AI Coding Agent 的 Harness Skill 项目，提取设计模式、最佳实践和可复用方案。

## 分析对象

| 项目 | 仓库 | Stars | 定位 |
|------|------|-------|------|
| **OpenSpec** | [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | 53K+ | Spec-Driven Development (SDD) 规约驱动开发 |
| **Superpowers** | [obra/superpowers](https://github.com/obra/superpowers) | 228K+ | 完整软件方法论 — Brainstorming→Plan→TDD→Review |
| **GSD** | [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core) | 4K+ | 元提示+上下文工程，五阶段循环 (Discuss→Plan→Execute→Verify→Ship) |
| **Matt Pocock Skills** | [mattpocock/skills](https://github.com/mattpocock/skills) | 129K+ | 实战工程技能集 (diagnose/tdd/triage/to-issues) |

## 分析维度

每个项目从以下维度分析：

1. **Skill 结构设计** — SKILL.md 格式、元数据、触发机制
2. **工作流模型** — 任务分解、状态管理、流程编排
3. **Agent 协作模式** — Sub-agent 调度、并行/串行、上下文隔离
4. **上下文工程** — 提示注入策略、CLAUDE.md 组织、Token 优化
5. **质量保障** — Review 机制、验证循环、纠错能力
6. **跨平台兼容** — 多 Agent 运行时支持（Claude Code/Codex/Cursor/Gemini CLI）

## 项目结构

```
harness-skill-analysis/
├── README.md                  # 项目总览
├── CLAUDE.md                  # Claude Code 项目配置
├── docs/                      # 共享文档
│   └── comparison.md          # 四项目对比分析
├── repos/                     # 克隆的源码仓库（gitignored）
├── analysis/
│   ├── openspec/              # OpenSpec 分析
│   ├── superpowers/           # Superpowers 分析
│   ├── gsd/                   # GSD 分析
│   └── mattpocock/            # Matt Pocock Skills 分析
└── .gitignore
```

## 快速开始

```bash
# 克隆四个仓库
cd repos
git clone https://github.com/Fission-AI/OpenSpec.git openspec
git clone https://github.com/obra/superpowers.git superpowers
git clone https://github.com/open-gsd/gsd-core.git gsd
git clone https://github.com/mattpocock/skills.git mattpocock
```
