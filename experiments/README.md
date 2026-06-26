# Harness Skill 工程验证实验

## 实验目的

通过相同的需求、相同的规范起点，分别使用四个 Harness 工程（OpenSpec、Superpowers、GSD、Matt Pocock Skills）
从0到1完成功能开发，记录每个工程的完整开发周期、Skill 调用链、Hook 触发情况、中间产物，
从而横向对比各工程的设计理念和实际表现。

## 实验设计

### 对照变量控制

| 变量 | 控制方式 |
|------|---------|
| **需求** | 四个实验使用完全相同的需求文档 |
| **代码规范** | 四个实验使用完全相同的代码规范 |
| **设计规范** | 四个实验使用完全相同的 API 设计规范 |
| **项目背景** | 四个实验使用完全相同的项目背景描述 |
| **技术栈** | 全部使用 Node.js + TypeScript + Express |
| **开发流程** | 各自使用对应 Harness 工程的标准 Skill 链 |

### 四个 Harness 工程的核心差异

| 维度 | OpenSpec | Superpowers | GSD | Matt Pocock |
|------|----------|-------------|-----|-------------|
| **核心理念** | 规范驱动（Spec-Driven） | 行为塑造（Behavioral Shaping） | 阶段管道（Phase Pipeline） | 领域语言（Domain Language） |
| **入口方式** | CLI 工具 (`openspec init`) | SessionStart Hook 自动注入 | `/gsd-new-project` 命令 | `/setup-matt-pocock-skills` |
| **规划机制** | proposal → specs → design → tasks | brainstorming → writing-plans | discuss → plan (research+check循环) | grill-with-docs → to-prd → to-issues |
| **执行机制** | `/opsx:apply` 逐任务执行 | subagent-driven / executing-plans | gsd-executor 并行 Wave 执行 | tdd 红-绿-重构循环 |
| **验证机制** | `/opsx:verify` 完整性检查 | verification-before-completion | `/gsd-verify-work` 对话式UAT | /review 双轴报告 |
| **Hook 系统** | 无独立 Hook（内嵌于 CLI） | SessionStart 注入 | 17个Hook全方位防护 | git-guardrails 安全Hook |
| **状态存储** | 文件系统（openspec/changes/） | 文件系统（docs/superpowers/） | 文件系统（.planning/） | 问题跟踪器 + 文件系统 |

## 实验目录结构

```
experiments/
├── README.md                    # 本文件 - 实验设计
├── common-specs.md              # 通用规范（需求+代码规范+设计规范+项目背景）
├── openspec/
│   ├── process-record.md        # 过程记录
│   └── src/                     # 实际代码产出
├── superpowers/
│   ├── process-record.md
│   └── src/
├── gsd/
│   ├── process-record.md
│   └── src/
└── mattpocock/
    ├── process-record.md
    └── src/
```
