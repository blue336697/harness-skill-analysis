---
name: multi-model-review
description: 多模型对抗代码审查——启动 3 个不同模型/视角的 sub-agent 并行审查同一份代码变更，交叉验证后输出合并报告。
triggers:
  - 用户说"多模型审查"、"multi-model-review"、"对抗审查"、"交叉审查"
allowed-tools: [Read, Bash, Grep, Glob, Agent]
---

# Multi-Model Review — 多模型对抗代码审查

## 设计哲学

来自美团实践：**"高阶模型审查低阶模型产出，不同厂商模型对抗互相审核，通过差异化能力互补，实测 CR 覆盖面更全"**。

Claude Code sub-agent 支持不同 model 参数。3 个并行 Reviewer，各用不同 model + 不同视角 → 去重合并 → 置信度标注。

## 核心原则

1. **差异化覆盖**：不同模型有不同"盲区"，3 视角 > 1 视角
2. **独立判断**：每个 Reviewer 独立审查，不受他人影响
3. **置信度投票**：3/3 = 高置信，1/3 = 需人工判断
4. **不替代人工 CR**：这是 Pre-PR 的增强，人工 CR 仍需关注业务语义

## 模型配置策略

### 策略 A：代码由 Haiku 生成（默认）

| Reviewer | Model | 视角 |
|----------|-------|------|
| R1 | **opus** | 架构一致性 + 安全漏洞 |
| R2 | **sonnet** | 业务逻辑 + 边界条件 + 异常处理 |
| R3 | **sonnet** | 代码风格 + 性能 + 可维护性 |

### 策略 B：代码由 Sonnet 生成

| Reviewer | Model | 视角 |
|----------|-------|------|
| R1 | **opus** | 架构 + 安全 + 业务逻辑 |
| R2 | **opus** | 边界条件 + 异常处理 + 性能 |
| R3 | **sonnet** | 代码风格 + 可维护性 + 一致性 |

### 策略 C：代码由 Opus 生成

| Reviewer | Model | 视角 |
|----------|-------|------|
| R1 | **sonnet** | 代码风格 + 边界条件 + 性能 |
| R2 | **sonnet** | 安全 + 异常处理 + 一致性 |
| R3 | **haiku** | 命名规范 + 注释 + 代码重复 |

> 原则：用更高阶模型审查低阶产出；同等模型用不同视角互补；始终有一双"不同的眼睛"。

## 执行流程

### Phase 1: 确定代码来源和变更范围

从 git log 或 PR 描述中判断代码生成模型 → 选择审查策略。`git diff --name-only origin/main...HEAD` 确定变更范围。>20 个文件时聚焦核心变更。

### Phase 2: 并行启动 3 个审查 Agent

```
Agent R1 (model=opus): 审查架构一致性和安全性
Agent R2 (model=sonnet): 审查业务逻辑和边界条件
Agent R3 (model=sonnet/haiku): 审查代码风格和性能
```

每个 Agent 按 CRITICAL/HIGH/MEDIUM/LOW 四级输出问题清单。

### Phase 3: 交叉验证与合并

1. **去重**：相同文件+相同问题 → 合并为一条
2. **置信度**：
   - 🟢 高(3/3) / 🟡 中(2/3) → 自动纳入
   - 🟠 低(1/3, CRITICAL/HIGH) → 纳入，标注"需人工判断"
   - ⚪ 低(1/3, MEDIUM/LOW) → 纳入但不阻塞
3. **矛盾检测**：不同 Reviewer 结论矛盾 → 标注"需人工仲裁"

### Phase 4: 输出合并报告

汇总各 Reviewer 发现，标注置信度和矛盾项。输出 CRITICAL/HIGH/MEDIUM/LOW 四级问题及统计。
