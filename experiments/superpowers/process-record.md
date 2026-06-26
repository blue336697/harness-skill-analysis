# Superpowers 实验过程记录

## 实验概述
- **Harness**: Superpowers v5.1.0
- **工作流**: brainstorming → writing-plans → subagent-driven-dev → TDD → code-review → finishing
- **需求**: TaskFlow API (同 common-specs.md)
- **结果**: 7/7测试通过

---

## 阶段0: SessionStart Hook 注入

Superpowers 通过 `hooks/session-start` 在会话启动时自动注入 `using-superpowers` 引导脚本。

**Hook 触发链**:
```
SessionStart → run-hook.cmd (跨平台polyglot: 同时合法的cmd+bash) → session-start (bash)
  → 读取 using-superpowers/SKILL.md → 注入为 additionalContext
  → 技能通过 description 自动匹配触发
```

**与 GSD Hook 系统对比**: Superpowers 仅有 SessionStart Hook（注入引导脚本），而 GSD 有 17 个 Hook（PreToolUse/PostToolUse 多层防护）。

---

## 阶段1: brainstorming 技能 (设计阶段)

### 触发方式
AI 根据 description 自动匹配: "You MUST use this before any creative work"

### 9步设计清单
1. 探索项目上下文 → greenfield 项目
2. 视觉伴侣 → 不适用 (API项目)
3. 逐一提问 → **每次只问一个问题**
4. 提出2-3种方案 → 方案A(分层函数式，推荐) vs B(面向对象) vs C(内联)
5. 逐节展示设计 → **逐节展示，每节后获取批准**
6. 写入设计文档 → `docs/superpowers/specs/2026-06-16-taskflow-api-design.md`
7. 规格自查 → 检查占位符、矛盾、歧义
8. 用户审查规格 → 审查 spec 文件
9. 调用 writing-plans → **终端状态**

### HARD-GATE 硬门控机制
```
<HARD-GATE>
在展示设计并获得用户批准之前，禁止调用任何实施技能、编写任何代码、
搭建任何项目或采取任何实施动作。
</HARD-GATE>
```

**反模式守卫**: 显式驳斥"这个太简单不需要设计"的想法

### 中间产物
- `docs/superpowers/specs/2026-06-16-taskflow-api-design.md`
  - 架构、组件分解(7个组件)、数据模型、API设计(5端点)、错误处理、测试策略、存储方案

---

## 阶段2: writing-plans 技能 (规划阶段)

### 核心要求
- **2-5分钟微任务**: "写失败测试" → "运行确认失败" → "实现" → "运行测试" → "提交"
- **每步含完整代码**: 禁止 TBD/TODO/占位符
- **TDD 内置**: RED→GREEN→REFACTOR 每任务
- **文件映射**: 每个任务显式列出 创建/修改/测试 文件路径

### Plan Header 格式
```markdown
> **给自动化工作者的说明:** 必需子技能: superpowers:subagent-driven-development
**目标:** [一句话]
**架构:** [2-3句话]
**技术栈:** [关键技术]
```

### 中间产物
- `docs/superpowers/plans/2026-06-16-taskflow-api.md` (6个任务组, ~30个微步骤, 每步含完整代码)

### 与 OpenSpec tasks.md 对比
| 维度 | OpenSpec | Superpowers |
|------|----------|-------------|
| 任务粒度 | 34个任务 | ~30个微步骤 |
| 代码包含 | 无代码，仅描述 | **每步含完整代码** |
| TDD | config声明 | **每任务 RED→GREEN→REFACTOR** |
| 占位符 | 允许描述性任务 | **禁止 TBD/TODO** |
| 执行方式 | /opsx:apply 自动 | 指向 subagent-driven-dev |

---

## 阶段3: 实施 (subagent-driven-development + TDD)

### 执行模式
- **subagent-driven-development** (推荐): 实施者 + 规格审查者 + 代码质量审查者 三个子代理
- **executing-plans**: 主会话顺序执行

### TDD 铁律
- RED（失败测试）→ 验证（确认失败原因正确）→ GREEN（最小代码）→ 验证（确认通过）→ REFACTOR（重构）
- 无失败测试先行的生产代码 = 删除重来

### 产出
```
src/types/task.ts         (75行)
src/validators/task.ts    (69行)
src/services/task.ts      (69行)
src/routes/task.ts        (61行)
src/middleware/error.ts   (28行)
src/app.ts                (15行)
src/index.ts              (10行)
src/__tests__/task.test.ts (148行, 7测试通过)
```

---

## 阶段4: 后续步骤 (实验范围外)
1. requesting-code-review → 优势 + 问题(关键/重要/次要) + 评估
2. verification-before-completion → 识别→运行→读取→验证
3. finishing-a-development-branch → 合并/PR/保留/丢弃

---

## 技能链总览
```
SessionStart Hook → using-superpowers (引导脚本)
  → brainstorming (自动触发, 9步清单)
    → writing-plans (终端状态, 微任务含代码)
      → subagent-driven-development (推荐)
        ├── 实施者子代理
        ├── 规格审查者子代理
        └── 代码质量审查者子代理
          → test-driven-development (RED→GREEN→REFACTOR)
            → requesting-code-review
              → verification-before-completion
                → finishing-a-development-branch
```

## 核心特征

| 维度 | 特点 |
|------|------|
| 触发 | SessionStart Hook 注入 + description 自动匹配 |
| 设计门控 | HARD-GATE: 无批准设计=零代码 |
| 规划粒度 | 2-5分钟微任务，每步含完整代码 |
| TDD | 内置 RED→GREEN→REFACTOR, 红旗表 |
| 子代理 | 实施者 + 规格审查者 + 代码质量审查者 |
| 行为塑造 | 铁律/红旗表/反借口表/说服原则 |
| 状态存储 | docs/superpowers/{specs,plans}/ |
| Hook | 仅 SessionStart (对比 GSD 的17个Hook) |

## 与 OpenSpec 的关键差异
1. **触发**: Hook自动注入 vs CLI手动执行
2. **设计**: 逐节审查批准 vs 一次性生成全部artifact
3. **规划**: 每步含完整代码 vs 描述性任务
4. **门控**: HARD-GATE vs AI自律
5. **评审**: 独立code-review技能 vs artifact完整性检查
