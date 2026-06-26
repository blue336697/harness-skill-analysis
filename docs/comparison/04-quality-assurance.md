# 质量保障对比

> 四个项目如何验证代码质量、防止 Bug、确保流程合规。

## 一、Superpowers：六层 TDD 防御 + 两级审查

### 1.1 Iron Law

**出处**：`repos/superpowers/skills/test-driven-development/SKILL.md` L31-39

```markdown
## 铁律

**没有先失败的测试，禁止写任何生产代码**

在测试之前写了代码？删除它。重新开始。

**没有例外：**
- 不要保留为"参考"
```

> 原文：NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST. Write code before the test? Delete it. Start over. No exceptions — Don't keep it as "reference".

### 1.2 六层防御体系

| 层 | 机制 | 效果 |
|----|------|------|
| 1 | **铁律**：先测试失败，再写代码 | 禁止 TDD 倒置 |
| 2 | **HARD-GATE**：设计批准前禁止写代码 | 禁止跳过设计 |
| 3 | **Red Flags 表**：Agent 自我检查违规信号 | 心理自查 |
| 4 | **理性化表格**：预驳 12 个跳过流程的借口 | 堵死借口 |
| 5 | **违规即重启**：删除未经测试的代码，重来 | 零容忍 |
| 6 | **验证 Gate**：必须运行命令并展示输出 | 证据驱动 |

**出处**：1-2 来自 `brainstorming/SKILL.md`，3-4 来自 `using-superpowers/SKILL.md`，5-6 来自 `tdd/SKILL.md` 和 `verification-before-completion/SKILL.md`

### 1.3 两级审查

**出处**：`repos/superpowers/skills/subagent-driven-development/SKILL.md`

```
每个任务：Implementer → Spec Review → Code Quality Review
四种返回状态：
  DONE                    — 完成
  DONE_WITH_CONCERNS     — 完成但有关切
  NEEDS_CONTEXT           — 需要更多上下文
  BLOCKED                 — 被阻塞
```

---

## 二、GSD：对抗性验证 + Slopcheck

### 2.1 对抗性验证

验证从"目标未达成"的假设出发，每个声明必须解析为：

```
VERIFIED    — 有证据支持（已验证通过）
FAILED      — 有证据反驳（验证未通过）
UNCERTAIN   — 无足够证据（不确定）
```

### 2.2 Plan Checker（最多 3 轮）

```
Plan → plan-checker 审查 → 通过 → Execute
       ↑_____________↓ 未通过（最多 3 轮自动修正）
```

### 2.3 Slopcheck：AI 幻觉包检测

Agent 写入依赖配置前，扫描是否存在不真实的外部包名。防止 AI 幻觉出假的 npm/PyPI/crates.io 包。

### 2.4 原子 Git 提交

部分完成的代码不丢失。Agent 中途崩溃 → 已提交部分保持完整。

---

## 三、OpenSpec：操作前验证 + 四层检查

### 3.1 四层验证

```
第1层: Schema 验证   (openspec schema validate)
第2层: 变更验证      (openspec validate --strict)
第3层: AI Agent 验证 (完整性/正确性/一致性)
第4层: Delta Spec 合并验证（验证 pass → 写入 pass）
```

**出处**：`repos/openspec/src/commands/validate.ts`

### 3.2 操作前验证模式

```
所有副作用操作：先验证 → 通过后执行 → 执行后再验证
验证失败 → 写入被阻止
```

### 3.3 回滚

删除 change 目录 = 完整撤销。归档后需手动恢复。

---

## 四、Matt Pocock：快速反馈 + 精确审查

### 4.1 TDD 垂直切片

**出处**：`repos/mattpocock/skills/engineering/tdd/SKILL.md` L18-41

```
禁止（水平切片）：
  RED:   一次性写完 5 个测试
  GREEN: 一次性写完 5 个实现

正确（垂直切片）：
  test1→impl1→refactor → test2→impl2→refactor → ...
```

### 4.2 反馈循环优先级

**出处**：`repos/mattpocock/skills/engineering/diagnose/SKILL.md` L14

> 一个 30 秒的不稳定循环几乎跟没有循环一样糟糕。一个 2 秒的确定性循环是调试的超能力。

> 原文：A 30-second flaky loop is barely better than no loop. A 2-second deterministic loop is a debugging superpower.

### 4.3 Code Review 四级

```
CRITICAL → 安全漏洞、数据丢失 → 阻塞合并
HIGH     → 明确的 Bug      → 应修复
MEDIUM   → 可维护性问题     → 考虑修复
LOW      → 风格偏好        → 可选修复
```

### 4.4 git-guardrails Hook

**出处**：`repos/mattpocock/skills/misc/git-guardrails-claude-code/SKILL.md`

PreToolUse Hook 拦截：`push --force`、`reset --hard`、`clean -f`、`branch -D`

---

## 五、对比总结

| 维度 | Superpowers | OpenSpec | GSD | Matt Pocock |
|------|------------|----------|-----|-------------|
| **防御层级** | **6 层** | 4 层 | 对抗性 + Plan Checker | 建议性 3 层 |
| **强制力** | ★★★★★ 违规删除代码 | ★★★★ 操作前验证 | ★★★★ 状态机门控 | ★★ 建议 |
| **审查类型** | 两级串行（Spec+Quality） | AI + Delta 合并 | 对抗性反向验证 | 单级 code-review |
| **幻觉检测** | 无 | Schema 验证 | **Slopcheck** | 无 |
| **Git 防护** | 无 | 无 | Prompt Guard | **git-guardrails** |
| **验证标准** | 展示测试输出 | 操作前验证 pass | **已验证/失败/不确定** | 四级严重度 |

### 核心差异

- **Superpowers**：质量 = 流程纪律。假设 Agent 会找借口 → 六层死防
- **GSD**：质量 = 证据驱动。声明必须量化到三种状态
- **OpenSpec**：质量 = 原子保证。验证通过才写入
- **Matt Pocock**：质量 = 反馈速度。快速循环 > 重流程
