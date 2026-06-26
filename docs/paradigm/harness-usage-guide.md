# Harness 使用规范教程

> 面向团队全员的 Claude Code AI Coding 范式操作手册。
> 覆盖：有哪些 Skill、什么时候用、怎么用、常见问题。

---

## 一、你的工具箱

初始化完成后，你有以下组件在工作：

```
每次会话自动加载（你不需要做任何事）：
├── CLAUDE.md              架构约束 + 编码规范 + 领域知识
├── .claude/rules/         细分规则（architecture + coding-standards）
└── CONTEXT.md             领域术语定义

你需要主动调用的（说对应的话触发）：
├── /brainstorming          新功能设计（有HARD-GATE，禁止跳步）
├── /writing-plans          设计→任务分解
├── /subagent-driven-development  执行计划（逐任务sub-agent+两级审查）
├── /executing-plans        执行计划（轻量，单会话TodoWrite跟踪）
├── /tdd                   单个功能/函数的测试驱动开发
├── /diagnose              Bug诊断（构建反馈循环）
├── /pre-pr-check          提交前7维度AI自查 ★
├── /tech-debt-scan        技术债穷举扫描 ★
├── /multi-model-review    多模型对抗审查 ★
├── /sop-from-master       从主R操作生成SOP ★
├── /code-review           标准代码审查
└── /triage                Issue分类

★ = 本范式自定义Skill
Superpowers生态: brainstorming / writing-plans / subagent-driven-development / executing-plans
Matt Pocock生态: tdd / diagnose / code-review / triage
```

---

## 二、场景速查

**先查这张表，再决定用什么 Skill。不要每次都走全流程。**

| 我要做什么 | 改动规模 | 走什么流程 |
|-----------|---------|-----------|
| 改一行配置/常量 | 1行 | 直接说需求，AI改 |
| 改一个文件 | <50行 | AI改 → `/pre-pr-check` |
| 改3-5个文件 | 50-200行 | AI改 → `/code-review` → `/pre-pr-check` |
| 新功能（简单CRUD） | 2-3个文件 | 直接描述 → AI写 → 写测试验证 → `/pre-pr-check` |
| 新功能（复杂逻辑） | 5+文件 | `/brainstorming` → `/writing-plans` → `/subagent-driven-development` → `/pre-pr-check` |
| 修Bug（能复现） | 1-3文件 | `/diagnose` → `/tdd` → `/pre-pr-check` |
| 修Bug（不能复现） | — | 先描述现象，AI辅助构建复现 → `/diagnose` → `/tdd` |
| 重构存量代码 | 多文件 | `/tech-debt-scan`摸底 → 主R打样 → `/sop-from-master` → 全组SOP铺开 |
| 准备提交PR | — | `/pre-pr-check`（必须） |
| CR别人的重要PR | — | `/multi-model-review`（可选，核心模块推荐） |
| CR别人的普通PR | — | `/code-review` |

---

## 二-B、两个生态系统：Superpowers vs Matt Pocock

**关键认知**：Skill 来自两个独立生态系统，它们的产物格式不兼容。

```
Superpowers 生态                         Matt Pocock 生态
─────────────────                       ────────────────
/brainstorming  → 设计文档               /grill-me    → 需求澄清
/writing-plans  → 结构化任务计划          /tdd         → 单个功能红绿重构
/subagent-driven-development             /diagnose    → Bug诊断
  → 消费计划 → 逐任务sub-agent          /code-review → 代码审查
  → 两级审查(spec+quality)
  → 状态跟踪(DONE/CONCERNS/BLOCKED)
/executing-plans
  → 消费计划 → TodoWrite逐任务
```

**核心规则**：`/writing-plans` 产出的计划只能被 Superpowers 的 `/subagent-driven-development` 或 `/executing-plans` 消费。`/tdd` 不理解 Superpowers 的计划格式，也没有多任务状态跟踪。

**什么时候用哪个**：

| 场景 | 执行引擎 | 理由 |
|------|---------|------|
| 复杂功能，多人并行 | `/subagent-driven-development` | sub-agent隔离 + 两级审查 |
| 复杂功能，单人串行 | `/executing-plans` | 轻量，TodoWrite跟踪即可 |
| 单个功能/函数 | `/tdd` | 不需要计划，直接红绿重构 |
| Bug修复 | `/diagnose` → `/tdd` | 先定位再修复 |

**如果非要混合**（不推荐）：`/brainstorming` → `/writing-plans` → **人读计划** → 对每个任务手动说 `/tdd 实现任务1：xxx`。这时人是两个生态之间的胶水，状态跟踪也靠人。

---

## 二-C、三层痕迹体系：简单改动也不丢上下文

**核心矛盾**：复杂路径有设计文档+任务计划+审查记录，简单路径只有 git log。但简单改动量最大、频次最高，20 次小改动累积的隐知识足以让一个模块变得"没人敢碰"。

**解法**：不追求全量文档化。不同规模的改动走不同深度的痕迹。

### 痕迹分层

```
                        简单改动          中等改动          复杂改动
                        ────────          ────────          ────────
git commit              ✅ 必须           ✅ 必须           ✅ 必须
pre-pr-check 报告       ✅ 必须           ✅ 必须           ✅ 必须
code-review             ❌ 不需要         ✅ 建议           ✅ 必须
Memory（如有经验教训）    ✅ 建议           ✅ 建议           ✅ 建议
设计文档                ❌ 不需要         ❌ 不需要         ✅ 必须
任务计划+状态跟踪        ❌ 不需要         ❌ 不需要         ✅ 必须
多模型对抗审查          ❌ 不需要         ❌ 不需要         ✅ 核心模块
```

### 简单改动的痕迹够用吗？够的

简单改动共同拥有三条痕迹：

| 痕迹 | 存了什么 | 什么时候用到 |
|------|---------|-------------|
| **git log** | 谁、什么时候、改了什么文件、commit message | 回溯历史、定位 Bug 引入点、理解代码演变 |
| **pre-pr-check 报告**（贴在 PR 里） | 改了哪些文件、每个维度发现了什么、修了什么 | 理解这次改动的范围和风险 |
| **PR 描述**（AI 自动生成） | 改动概述、影响范围、需重点关注的逻辑 | CR 时快速理解上下文、后续考古 |

对 2-3 个文件的 CRUD 改动来说，这三条足够了——改动本身简单，不需要设计文档解释"为什么"。

### 但隐知识会流失——用 Memory 填补

真正的问题是：简单改动中发现的**非显而易见的规则**，如果不记录，下次换个人（或同一个人的下一次会话）AI 会重复踩坑。

```
场景：改 PaymentClient，发现银行端 SLA 是 25s，timeout 必须 ≥ 30s。

✅ 做法：
  "记住：PaymentClient 的 timeout 必须 ≥ 30s，因为银行端 SLA 是 25s，
   低于这个值会导致生产环境超时误报。"
  → AI 写一条 project 类型 Memory

效果：
  下次任何人（任何会话）改 PaymentClient 时，
  这条 Memory 自动以 <system-reminder> 召回，AI 在动手前就知道这个约束。
```

**Memory 是简单路径的设计文档替代品**——一条 Memory 的前端成本是一句话，但召回是全自动的。它不追求"结构化"和"完整"，只追求"下次别再踩"。

### 什么时候必须写 Memory

| 触发条件 | 示例 |
|---------|------|
| AI 踩了一个坑，你纠正了它 | "这个字段不能重命名，前端有硬编码依赖" |
| 发现了一个非显而易见的业务规则 | "订单金额单位是分，不是元" |
| 改代码时发现了一个隐藏约束 | "这个 SQL 必须用 FOR UPDATE，否则并发会超卖" |
| 外部依赖的特殊行为 | "银行回调不保证顺序，必须先查状态再处理" |

**不需要写 Memory**：显而易见的代码规范、已经在 CLAUDE.md 里的规则、一次性的临时修改。

### Memory vs 设计文档

| | Memory | 设计文档（brainstorming产出） |
|------|--------|------------------------------|
| 粒度 | 一条一个事实 | 一个功能的设计全貌 |
| 创建成本 | 一句话 | 30min-1h 的 brainstorming 对话 |
| 召回方式 | 语义匹配，自动 | 需要人工找到并阅读 |
| 适用场景 | 跨会话的经验传递 | 理解一个功能"为什么这样设计" |
| 生命周期 | 长期（除非被明确废弃） | 设计阶段结束后基本不再更新 |

---

## 三、核心 Skill 详解

### 3.1 `/pre-pr-check` — 提交前自查 ★ 最常用

**触发时机**：准备 `git push` 或创建 PR 之前。

**说什么**：
```
/pre-pr-check
```
或
```
运行 pre-pr-check，对比 origin/main
```

**AI 会做什么**：
1. 确定变更范围（`git diff origin/main...HEAD`）
2. 对每个变更文件做 6 维度检查：
   - 规范合规：分层违反？命名不规范？硬编码？
   - Bug扫描：空catch？空值检查？边界条件？并发安全？
   - 异常处理：空catch块？丢失cause？无try-catch的外部调用？
   - 一致性：新代码模式是否与同模块已有代码一致？
   - 可扩展性：flag参数反模式？上帝类？
   - 性能：N+1查询？无分页？循环内RPC？
   - 死代码：新旧代码并存？删除不完整？注释掉的代码块？

**输出示例**：
```
CRITICAL (1): UserService.java:42 空catch块吞异常  ← 阻塞合并
HIGH (2):     OrderRepo.java:88 循环内DB查询      ← 应该修复
MEDIUM (3):   ...                                  ← 建议修复
LOW (2):      ...                                  ← 可选
```

**你做什么**：
1. 看完报告
2. 如果 CRITICAL/HIGH > 0：说 `修复所有 CRITICAL 和 HIGH 问题`，AI 逐个修
3. AI 修完后自动生成 PR 描述文档，你可以直接贴在 PR 里
4. 如果全绿：直接 `git push` 创建 PR

**注意事项**：
- **一定要在人工 CR 之前跑**。不要让 Reviewer 浪费时间看 AI 能发现的问题。
- 如果你确定某个 HIGH 不需要修（比如 N+1 数据量小没影响），说 `跳过 H2，原因标注一下`。
- MEDIUM/LOW 不阻塞合并，但会留在 PR 描述里供 Reviewer 参考。

---

### 3.2 `/tech-debt-scan` — 技术债盘点

**触发时机**：接手一个新模块、开始重构前、每两周例行盘点。

**说什么**：
```
/tech-debt-scan src/main/java/com/company/order/
```
或只扫描变更：
```
/tech-debt-scan
```
全量扫描：
```
/tech-debt-scan --full
```

**AI 会做什么**：
1. 确认扫描范围和债务类型（默认9种全选）
2. 对范围内每个文件做穷举检查
3. 按 P0/P1/P2 自动分级
4. 写入 `.claude/tech-debt.md`
5. 输出摘要报告

**输出示例**：
```
🔍 扫描范围: src/main/java/com/company/order/
   扫描文件: 47个 | 发现债务: 23项

P0 (2): 🔴 安全漏洞/数据丢失
  • OrderService.java:88 支付超时未处理 → 订单可能卡死
  • PaymentClient.java:45 API Key硬编码

P1 (8): 🟡 分层违反/N+1/循环依赖
P2 (13): 🟢 大函数/命名/硬编码
```

**你做什么**：
1. 逐项确认 P0/P1：AI 的分级只是建议，你来最终判定
2. 为 P0/P1 匹配"顺带业务需求"：下次改这个模块时顺手修哪个债
3. 更新 `.claude/tech-debt.md` 中的状态和顺带需求列

**注意事项**：
- **不要等专项重构排期**。美团的教训：技术债当业务需求的"顺带动作"消化。
- P2 不用追，等文件正好被改到时顺手修。
- 下次跑 `/tech-debt-scan` 时，AI 会自动 diff：标记新增债务和已修复债务。

---

### 3.3 `/multi-model-review` — 多模型对抗审查

**触发时机**：核心模块的重要 PR（金额相关、安全相关、核心业务逻辑）。

**说什么**：
```
/multi-model-review
```

**AI 会做什么**：
1. 判断代码来源（谁生成的代码），自动选择审查策略
2. 并行启动 3 个 sub-agent：

| Reviewer | Model | 审查视角 |
|----------|-------|---------|
| R1 | Opus | 架构一致性 + 安全漏洞 |
| R2 | Sonnet | 业务逻辑 + 边界条件 + 异常处理 |
| R3 | Sonnet | 代码风格 + 性能 + 可维护性 |

3. 去重合并，按置信度标注：
   - 🟢 3/3 高置信 → 基本是实锤
   - 🟡 2/3 中置信 → 建议修
   - 🟠 1/3 低置信 → 人工判断

**你做什么**：
1. 🟢 高置信的问题直接修（三个不同视角都发现了，基本不是误报）
2. 🟠 低置信的问题自己看一眼判断
3. 如果有"矛盾待仲裁"项（R1说CRITICAL，R2说没问题），你来最终判断

**注意事项**：
- **没必要每个 PR 都跑**。普通 CRUD 用 `/code-review` 就够了。
- 第一次用的时候对比一下 `/multi-model-review` 和 `/code-review` 的输出差异，判断是否值得。

---

### 3.4 `/sop-from-master` — 主R打样 → SOP生成

**触发时机**：主R（核心开发）完成一个模块的重构/迁移后。

**前置条件**：
- 主R已经完成一个完整模块的重构
- 所有变更已 commit（多个 commit 更好，AI 能分析操作序列）
- 测试全部通过

**说什么**：
```
/sop-from-master
```

**AI 会做什么**：
1. 分析主R的 git history：提取所有 commit、变更文件、变更类型
2. 将变更归类为操作类型：提取类、重命名、拆分方法、移动文件、修改签名...
3. 从具体操作中抽取模板变量（`UserService` → `{Entity}Service`）
4. 生成结构化 SOP 文档，每个步骤包含：目标文件、操作规则、验收标准
5. 包含主R实际遇到的问题和解决方法（"常见问题"部分）

**输出**：`.claude/sops/SOP-001-简短描述.md`

**团队其他成员怎么做**：
```
请按照 .claude/sops/SOP-001-模块四层架构迁移.md，
帮我迁移 payment 模块。
```

AI 按 SOP 逐步骤执行，每步验收通过后才进入下一步。

**你做什么**：
- 主R：跑完后找一个人试用，迭代 SOP
- 其他成员：拿着 SOP 执行，遇到偏差立即停止，反馈给主R
- SOP 过期后移到 `.claude/sops/archive/`

**注意事项**：
- **SOP 是消耗品，不是长期资产**。代码演进后 SOP 会过期。重点维护 ADR（为什么这样设计）。
- SOP 标注过期条件（如"所有模块迁移完成后"或"架构变更时"）。

---

### 3.5 `/subagent-driven-development` — 执行计划（推荐）

**来源**：Superpowers  
**触发时机**：`/writing-plans` 完成后，需要按计划逐任务执行。

**说什么**：
```
/subagent-driven-development
```

**AI 会做什么**：
1. 读取 `/writing-plans` 产出的计划文件
2. 提取所有任务，创建 TodoWrite 跟踪
3. 对每个任务：
   - 派发独立 sub-agent（fresh context + git worktree 隔离）
   - Implementer 完成后 → 派发 spec reviewer sub-agent（验证符合计划）
   - Spec 通过 → 派发 code quality reviewer sub-agent（代码质量）
   - 任一 review 不通过 → implementer 修复 → 重新 review
   - 通过 → 标记任务 DONE，继续下一个

**四个任务状态**：
| 状态 | 含义 |
|------|------|
| DONE | 实现完成 + 两级审查通过 |
| DONE_WITH_CONCERNS | 完成但有已知问题，需人工决策 |
| NEEDS_CONTEXT | 计划信息不足，需要你补充 |
| BLOCKED | 被依赖阻塞，无法继续 |

**你做什么**：
- AI 会自动连续执行所有任务，不会每完成一个就问你
- 只有遇到 NEEDS_CONTEXT 或 BLOCKED 时才停下来
- 全部完成后运行 `/pre-pr-check`

**注意事项**：
- 需要 sub-agent 支持（Claude Code 原生支持）
- 相较于 `/executing-plans`，质量更高（每次两级审查），但更慢
- 任务之间应该尽量独立（否则用 `/executing-plans` 更合适）

---

### 3.6 `/executing-plans` — 执行计划（轻量）

**来源**：Superpowers  
**触发时机**：`/writing-plans` 完成后，任务间有依赖、或不需要两级审查。

**说什么**：
```
/executing-plans
```

**AI 会做什么**：
1. 读取计划文件，审查是否有逻辑缺口
2. 创建 TodoWrite，逐任务执行
3. 每个任务：标记 in_progress → 按步骤实现 → 跑验证 → 标记 completed
4. 全部完成后 → 触发 `/finishing-a-development-branch`

**与 subagent-driven-development 的区别**：
| 维度 | subagent-driven-development | executing-plans |
|------|---------------------------|-----------------|
| 执行方式 | 每个任务独立sub-agent + git worktree | 同一会话顺序执行 |
| 审查 | 两级（spec + quality） | 无强制审查 |
| 质量 | 高 | 中 |
| 速度 | 慢（每个任务要等review） | 快 |
| 适用 | 独立任务、高质量要求 | 依赖多的任务、速度优先 |

**你做什么**：
- AI 执行过程中不会频繁询问
- 如果遇到 BLOCKED，你需要介入解除阻塞
- 全部完成后运行 `/pre-pr-check`

---

### 3.7 `/diagnose` — Bug 诊断

**触发时机**：遇到 Bug，不知道原因。

**说什么**：
```
/diagnose 用户反馈订单状态卡在pending不流转，数据库里今天有47条
```

**AI 会做什么**：
1. Phase 1（核心）：构建反馈循环——用最简单的方式先复现
2. Phase 2：复现 → Phase 3：假设根因 → Phase 4：仪器化 → Phase 5：修复 → Phase 6：事后分析

**最关键的原则**：
> "Build the right feedback loop, and the bug is 90% fixed."
> 在能复现之前，不要做任何猜测。

**反馈循环优先级**（AI 会从最简单的开始）：
现有测试 → curl/CLI → 浏览器脚本 → 重放 → 测试Harness → Fuzz → Bisect → Diff → 人工介入

**你做什么**：
- 帮助 AI 获取复现所需的信息（日志、数据样本、截图）
- 不要急于下结论。让 AI 先复现再假设
- 修完后对 AI 说 `给相关模块补充保护性测试`（美团策略二）

---

### 3.8 `/tdd` — 单个功能/函数的测试驱动开发

**来源**：Matt Pocock  
**触发时机**：实现单个功能点、修复单个 Bug。**注意**：`/tdd` 不能消费 `/writing-plans` 产出的计划，它只处理一个独立的功能/函数。

**说什么**：
```
/tdd 实现优惠券互斥规则：两个同类型的优惠券不能同时使用
```

**AI 会做什么**：
1. 🔴 RED：先写测试 → 展示给你确认
2. 🟢 GREEN：实现最少代码让测试通过
3. 🔵 REFACTOR：重构优化，测试仍通过

**核心规则**：
- 垂直切片（一次一个测试→实现），禁止水平切片
- AI 禁止修改已有测试代码
- AI 禁止跳过 Red 阶段

**你做什么**：
- 🔴 阶段：确认测试覆盖了正确的场景。**这是你精准传递需求的关键时刻**——测试就是你的需求文档。
- 🟢 阶段：让 AI 实现，你只看测试是否通过。
- 🔵 阶段：确认重构没有改变行为。

**最重要的心法**（来自美团第二篇文章）：
> 当你发现用自然语言描述需求怎么都说不清楚时，不要继续改提示词。直接写 2-3 个测试用例，它们就是无歧义的需求文档。

---

## 四、日常交互模式

### 4.1 开始新需求时的"三步确认"

对 AI 说需求之前，先做三件事：

```
1. 先看看有没有可顺带消化的技术债：
   读 .claude/tech-debt.md，找标记了"顺带业务需求"且匹配当前需求的 P0/P1

2. 确认受影响模块：
   告诉AI：我要改订单模块，先帮我列出受影响的文件和依赖

3. 确认策略：
   简单CRUD直接写 / 复杂逻辑走TDD / 改老代码先建测试基线
```

### 4.2 中途发现复杂时的模式切换

```
改到一半发现比想象中复杂：
→ 停下来，说 "这个比预期复杂，走 /tdd"
→ 先写测试定义行为，再实现
```

### 4.3 提交前的固定流程

```
1. /pre-pr-check
2. 修完 CRITICAL + HIGH
3. AI 生成 PR 描述
4. 如果是核心模块 → 考虑 /multi-model-review
5. git push → 创建PR
```

### 4.4 CR 时的"两遍法"

```
第一遍：自己用 /code-review 或 /multi-model-review 过一遍 → 修机器发现的问题

第二遍：人工看：
  - 设计意图对不对？（不是代码写得对不对，那是第一遍做的事）
  - 业务逻辑全不全？
  - 有没有更好的架构选择？
```

---

## 五、不同角色的日常用法

### 初级开发

```
每天做的事：
1. 接到需求 → 判断是简单CRUD还是复杂逻辑
2. 简单 → 描述需求让AI写 → 写测试验证
3. 复杂 → 找主R确认设计方向 → 主R走 /brainstorming → /writing-plans → 你走 /executing-plans 执行
4. 提交前 → /pre-pr-check
5. 看到 CRITICAL/HIGH → 说 "修复所有问题"

关键习惯：
- 每次 /pre-pr-check 的 MEDIUM/LOW 问题，挑1-2个修（积累经验）
- 遇到Bug先 /diagnose，不要自己蒙头猜
- 发现非显而易见的规则/约束 → 说"记住：xxx"写一条 Memory
- 改到一半发现比预期复杂 → 停下来，切换到 /brainstorming 重新设计
```

### 高级开发/主R

```
每周额外做的事：
1. 每两周跑一次 /tech-debt-scan（关注趋势）
2. 完成复杂模块迁移后跑 /sop-from-master
3. CR 重要 PR 时用 /multi-model-review
4. 维护 CLAUDE.md 和 .claude/rules/ 的规则质量
   - 如果某条规则被反复违反 → 规则表述不够精确 → 重写
   - 如果某条规则从未被触发 → 规则可能是多余的 → 删除

关键习惯：
- 你是"独裁者"——拍板架构和规范决策
- 你的核心产出不是代码行数，是"约束环境的质量"
- 每次 /sop-from-master 后找人试用，迭代
```

### Tech Lead/架构师

```
关注的事：
1. .claude/tech-debt.md 中 P0/P1 数量的趋势（在上升还是下降？）
2. /pre-pr-check 的 CRITICAL/HIGH 拦截趋势（规则在生效吗？）
3. 技术债"顺带消化"的执行率（P0/P1 有没有匹配到业务需求？）
4. CONTEXT.md 的术语歧义是否在减少

周期性动作：
1. 每季度组织一次共识复盘：
   - 哪些规则需要调整？
   - 领域术语有没有新歧义？
   - SOP 哪些已过期需要清理？
2. 新成员入职时走一遍 Phase 0-6 的初始化流程
```

---

## 六、常见问题

### Q: Pre-PR Check 跑太慢了怎么办？

A: 如果你只改了 2 个文件，可以说：
```
/pre-pr-check 只检查变更文件
```
大 PR 时可以分批提交。

### Q: AI 修 Pre-PR Check 发现的问题时引入了新问题？

A: 修完后再说一次 `/pre-pr-check`。AI 会重新检查修复后的代码。通常不要超过 3 轮。

### Q: 多模型 Review 和普通 Code Review 结果矛盾怎么办？

A: 看置信度。3/3 高置信 > 普通 Review。1/3 低置信 → 你自己判断。矛盾标注项 → 你仲裁。

### Q: SOP 执行到一半，实际情况和 SOP 描述不一致？

A: 立刻停下来。报告差异给主R。不要强行按 SOP 执行。主R 决定：更新 SOP / 手动处理 / 废弃 SOP 重写。

### Q: 技术债越扫越多怎么办？

A: 正常现象。关键看 P0/P1 的趋势：
- P0 应该在每次扫描后减少或清零
- P1 新发现 vs 已修复的速率比：如果新发现 >> 已修复 → 说明"顺带消化"机制没跑起来，去找主R调整
- P2 不用追，新增的 P2 很多说明代码质量在改善（以前根本没发现）

### Q: 怎么知道这套东西在生效？

A: 三个硬指标：
1. `/pre-pr-check` 的 CRITICAL 数量趋势（连续 3 周为 0 → 规则在生效）
2. 人工 CR 的反馈不再是"这里命名不对"、"那里少了个空值检查"
3. 技术债 P0 数量 ≤ 3 且每两周至少消灭 1 个

---

## 七、命令速查卡

```
┌─────────────────────────────────────────────────────────┐
│  AI Coding 命令速查                                     │
├─────────────────────────────────────────────────────────┤
│  场景              │  说什么                            │
├─────────────────────────────────────────────────────────┤
│  提交前            │  /pre-pr-check                     │
│  技术债盘点        │  /tech-debt-scan [模块路径]        │
│  重要PR审查        │  /multi-model-review               │
│  主R完成模块       │  /sop-from-master                  │
│  新功能设计        │  /brainstorming 描述需求           │
│  设计→计划         │  /writing-plans                    │
│  执行计划(推荐)     │  /subagent-driven-development      │
│  执行计划(轻量)     │  /executing-plans                  │
│  单个功能TDD        │  /tdd 描述要实现的逻辑             │
│  修Bug             │  /diagnose 描述症状               │
│  普通CR            │  /code-review                      │
│  Issue分类         │  /triage                           │
├─────────────────────────────────────────────────────────┤
│  改一行           → 直接说                              │
│  改一个文件       → AI改 → /pre-pr-check                │
│  改3-5个文件      → AI改 → /code-review → /pre-pr-check │
│  新功能           → /brainstorming → /writing-plans     │
│                   → /subagent-driven-development        │
│                   → /pre-pr-check                       │
│  重构             → /tech-debt-scan → 主R → SOP → 铺开  │
└─────────────────────────────────────────────────────────┘
```
