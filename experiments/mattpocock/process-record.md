# Matt Pocock Skills 实验过程记录

## 实验概述
- **Harness**: Matt Pocock Skills
- **工作流**: setup → grill-with-docs → to-prd → to-issues → tdd → review → improve-architecture
- **结果**: 7/7测试通过, 8个技能中间文件

---

## 阶段1: /setup-matt-pocock-skills — 项目设置

**技能来源**: `skills/engineering/setup-matt-pocock-skills/SKILL.md`
**特性**: `disable-model-invocation: true` — AI不可自动调用，必须用户显式触发。设计理由: 设置操作会修改项目文件。

**应生成的输出**:
- `CLAUDE.md` 更新 — 添加技能引用和项目上下文
- `docs/agents/domain.md` — 领域术语表模板
- `docs/agents/issue-tracker-local.md` — 本地 `.scratch/` 问题跟踪器配置
- `docs/agents/triage-labels.md` — 分类标签定义

---

## 阶段2: /grill-with-docs — 领域语言建立 ✅

**技能来源**: `skills/engineering/grill-with-docs/SKILL.md`
**实际加载路径**: `C:\Users\haojie.liu\.claude\skills\grill-with-docs\`

**流程**: 探索代码库 → 自问自答4个关键术语问题 → 写入CONTEXT.md → 创建ADR

**问题1**: Task的核心标识是什么？→ **Task.id 是聚合根标识** (UUID v4)
**问题2**: "Transition" vs "Status Change" 哪个是正式术语？→ **Transition** 是正式术语
**问题3**: Store的接口契约是什么？→ **Store = Map<string, Task>**，通过函数式依赖注入
**问题4**: AppError vs Domain Error 术语是否一致？→ **AppError** 是所有领域错误的基类

**中间产物**:
| 文件 | 内容 |
|------|------|
| `CONTEXT.md` | 领域术语表: 核心实体(Task/Status/Priority), 状态机(Transition/允许/禁止), 架构(Store/模块/服务/校验器), API契约(信封/端点), 错误模型(AppError/ValidationError/NotFoundError) |
| `docs/adr/0001-in-memory-store-for-mvp.md` | 架构决策记录: 为什么MVP用Map而非SQLite/PostgreSQL |

**grill-with-docs 特有机制**:
- 逐题访谈，每次只问一个问题
- 术语冲突检测(代码 vs 规范不一致时立即指出)
- CONTEXT.md 仅放术语表，不放实现细节
- ADR仅在三标准全部满足时创建(难逆转/需解释/真实权衡)

---

## 阶段3: /to-prd — PRD创建 ✅

**技能来源**: `skills/engineering/to-prd/SKILL.md`

**流程**: 探索代码库(已完成) → 确定测试接缝(HTTP层) → 按模板写PRD → 发布到问题跟踪器

**中间产物**:
| 文件 | 内容 |
|------|------|
| `.scratch/1-prd-task-crud-api.md` | 问题陈述, 解决方案, 10个用户故事, 8个实现决策, 5个测试决策, 6个超出范围项 |

**关键设计**: 使用CONTEXT.md术语(Transition/Store/Envelope/模块); 不包含文件路径和代码片段(会过时)

---

## 阶段4: /to-issues — 垂直切片分解 ✅

**技能来源**: `skills/engineering/to-issues/SKILL.md`

**流程**: 收集上下文(PRD) → 起草垂直切片 → 发布到问题跟踪器(.scratch/)

**垂直切片设计** (每个切片穿透所有层):
| Issue | 类型 | 依赖 | 覆盖用户故事 |
|-------|------|------|-------------|
| #2 创建任务 (示踪子弹) | AFK | 无 | #1 |
| #3 列出任务 | AFK | #2 | #2,3,4 |
| #4 获取任务 | AFK | #2 | #5 |
| #5 更新任务 + 状态转换 | AFK | #2 | #6,7,8 |
| #6 删除任务 | AFK | #2 | #9 |

**AFK = 可无人干预完成。每个切片穿透全部层(类型→校验→服务→路由→测试)。**

**中间产物**:
- `.scratch/2-issue-create-task.md` (含验收标准 + 被阻塞于)
- `.scratch/3-issue-list-tasks.md`
- `.scratch/4-issue-get-task.md`
- `.scratch/5-issue-update-task.md`
- `.scratch/6-issue-delete-task.md`

---

## 阶段5: /tdd — 测试驱动开发 (隐含在每个Issue中)

**技能来源**: `skills/engineering/tdd/SKILL.md`
**子技能**: deep-modules(深层模块), interface-design(接口设计), mocking(模拟), refactoring(重构), tests(测试)

**每个Issue的TDD循环**: RED(写失败测试) → 运行 → 确认失败 → GREEN(最小实现) → 运行 → 确认通过 → REFACTOR(重构)

---

## 技能链总览
```
/grill-with-docs (Skill工具加载)
  → 探索代码库 → 4题自问自答
    → CONTEXT.md (领域术语表)
    → docs/adr/0001-*.md (1个ADR)
      → /to-prd (SKILL.md指令)
        → .scratch/1-prd-task-crud-api.md
          → /to-issues (SKILL.md指令)
            → .scratch/2~6-issue-*.md (5个垂直切片)
              → /tdd (隐含, 每个issue独立执行)
```

## 核心特征

| 维度 | 特点 |
|------|------|
| 领域语言 | CONTEXT.md 强制一致术语 |
| 垂直切片 | 每个 issue 端到端可交付 |
| 状态中心 | Issue Tracker (.scratch/) 而非文件系统 |
| setup保护 | disable-model-invocation |
| 依赖 | 硬依赖 (to-issues等) vs 软依赖 (diagnose等) |
| 架构报告 | 自包含 HTML 可视化 |
| Hook | 仅 git-guardrails |

## 与其他 Harness 差异
| 维度 | Matt Pocock | OpenSpec | Superpowers | GSD |
|------|------------|----------|-------------|-----|
| 状态中心 | Issue Tracker | 文件系统 | 文件系统 | 文件系统 |
| 分解 | 垂直切片 | 水平层 | 混合 | 依赖波 |
| 领域语言 | CONTEXT.md | config.yaml | 无强制 | 无强制 |
| setup | disable-model-invocation | CLI交互 | SessionStart | CLI命令 |
| 架构可视化 | HTML报告 | 无 | 无 | 无 |
| Hook数量 | 1 | 0 | 1 | 17 |
