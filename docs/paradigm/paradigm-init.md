# AI Coding 范式初始化指令

> **⚠️ 本文档是给 AI 看的执行指令，不是给人类看的说明文档。**
>
> **使用方式**：在 Claude Code 中打开目标项目，然后说：
> ```
> 请阅读 D:/claudeProjects/harness-skill-analysis/docs/paradigm/paradigm-init.md，
> 按照文档中的 Phase 0-4 执行项目初始化。遇到 [HUMAN-NEEDED] 标记时停下来等我输入。
> ```
>
> **设计意图**：AI 自主完成 80% 的结构初始化工作，剩余的 20%（团队共识）由人类在会议中补充。
> [HUMAN-NEEDED] 标记 = 停下等待人类输入。无此标记 = AI 自主执行。

---

## 架构总览

```
项目根目录/
├── CLAUDE.md                  # [AI-AUTO] Bootstrap 入口（AgentOS 风格，<60行）
├── CONTEXT.md                 # [AI-AUTO] 从模板生成+代码扫描预填充
├── corrections.log            # [AI-AUTO] 学习循环日志（空文件）
├── knowledge/                 # [AI-AUTO] AgentOS Knowledge 模块（DDD 四文档）
│   ├── PRODUCT.md             # [AI-AUTO] 产品知识（预填充+[HUMAN-NEEDED]）
│   ├── TECH.md                # [AI-AUTO] 技术知识+ADR模板（[HUMAN-NEEDED]）
│   ├── IMPROVEMENT.md         # [AI-AUTO] 改进方向+禁止事项（[HUMAN-NEEDED]）
│   └── PROJECT.md             # [AI-AUTO] 项目状态（预填充+[HUMAN-NEEDED]）
├── governance/                # [AI-AUTO] AgentOS 三层治理
│   ├── principles.md          # [AI-AUTO] Starter Principles（[HUMAN-NEEDED] 确认）
│   ├── rules/
│   │   ├── _retired/          # [AI-AUTO] 退休规则存放
│   │   └── R001-*.md          # [AI-AUTO] 示例 rule 模板
│   └── gates/
│       ├── _graduated/        # [AI-AUTO] 毕业门禁存放
│       └── check-*.sh         # [AI-AUTO] 示例 gate 脚本
├── hooks/                     # [AI-AUTO] 生命周期钩子
│   ├── on-session-start.sh    # [AI-AUTO] 知识注入
│   └── on-session-end.sh      # [AI-AUTO] corrections 捕获
├── eval/                      # [AI-AUTO] 行为验证
│   ├── golden-set.md          # [AI-AUTO] 行为契约模板（[HUMAN-NEEDED]）
│   └── run-eval.sh            # [AI-AUTO] 质量评估脚本
├── .claude/
│   ├── tech-debt.md           # [AI-AUTO] 技术债跟踪
│   ├── rules/
│   │   ├── architecture.md    # [HUMAN-NEEDED] 团队共识后填充
│   │   └── coding-standards.md # [HUMAN-NEEDED] 团队共识后填充
│   ├── skills/                # [AI-AUTO] Skill 目录
│   ├── sops/                  # [AI-AUTO] SOP 目录
│   ├── settings.json          # [AI-AUTO] Hook + Skill 注册
├── docs/
│   └── adr/                   # [AI-AUTO] ADR 目录
```

---

## Phase 0: 环境检测

> **[AI-AUTO] 无需人类参与。AI 自主完成以下检测。**

### 0.1 确认当前工作目录

确认在目标项目根目录。

### 0.2 识别项目技术栈

扫描项目根目录，按优先级检测：

| 检测文件 | 判定语言 | 后续模板策略 |
|---------|---------|-------------|
| `pom.xml` | Java (Maven) | 使用 Java 分层示例 |
| `build.gradle` / `build.gradle.kts` | Java/Kotlin (Gradle) | 同上 |
| `package.json` (含 next/react) | TypeScript (Next.js/React) | 使用前端分层示例 |
| `package.json` (含 express/nestjs) | TypeScript (Node.js) | 使用后端分层示例 |
| `go.mod` | Go | 使用 Go 分层示例 |
| `Cargo.toml` | Rust | 使用 Rust 分层示例 |
| `pyproject.toml` / `setup.py` | Python | 使用 Python 分层示例 |

### 0.3 分析现有代码结构

- 列出源码目录结构（深度 3-4 层）
- 分析 import 依赖方向，推断当前分层结构
- 统计代码规模：总文件数、总行数、最大的5个文件、最大的5个函数

### 0.4 检测现有 AI Coding 基础设施

检查是否已有：
- `CLAUDE.md` → 如存在，备份为 `CLAUDE.md.bak.{date}`
- `CONTEXT.md` → 如存在，备份为 `CONTEXT.md.bak.{date}`
- `.claude/rules/` → 如存在，保留不动
- `.claude/skills/` → 如存在，保留不动
- `.claude/settings.json` → 如存在，读取并保留

### 0.5 输出环境检测报告

```markdown
## 项目环境检测报告

| 维度 | 检测结果 |
|------|---------|
| 项目名称 | {从目录名或构建文件提取} |
| 语言/框架 | {检测结果} |
| 源码路径 | {源码目录} |
| 总文件数 | {数量} |
| 总代码行 | {行数} |
| 现有分层 | {分层情况/面条式} |
| 最大文件 | {文件名+行数} |
| 最大方法 | {方法名+行数} |
| 已有 CLAUDE.md | 是/否 |
| 已有 .claude/ | {现有文件列表} |

👉 进入 Phase 1...
```

---

## Phase 1: 初始化目录结构

> **[AI-AUTO] 无需人类参与。**

```bash
# 原有目录
mkdir -p .claude/rules
mkdir -p .claude/skills
mkdir -p .claude/sops/archive
mkdir -p docs/adr

# AgentOS 模块目录
mkdir -p knowledge
mkdir -p governance/rules/_retired
mkdir -p governance/gates/_graduated
mkdir -p hooks
mkdir -p eval
touch corrections.log
```

确认所有目录创建成功后进入 Phase 2。

---

## Phase 2: 安装 Skill

> **[AI-AUTO] 先搜索本地已有 Skill，直接复用；找不到的询问用户是否安装。**

### Skill 分类

| 类型 | Skill | 来源 | 安装策略 |
|------|-------|------|---------|
| **自定义（必装）** | pre-pr-check | 本范式 | 从 paradigm 仓库直接复制 |
| | tech-debt-scan | 本范式 | 同上 |
| | multi-model-review | 本范式 | 同上 |
| | sop-from-master | 本范式 | 同上 |
| **Superpowers（推荐）** | brainstorming | superpowers/skills/ | 搜索本地 → 有则装，无则询问 |
| | writing-plans | superpowers/skills/ | 同上 |
| | subagent-driven-development | superpowers/skills/ | 同上 |
| | executing-plans | superpowers/skills/ | 同上 |
| **Matt Pocock（推荐）** | tdd | mattpocock/skills/ | 搜索本地 → 有则装，无则询问 |
| | diagnose | mattpocock/skills/ | 同上 |
| | code-review | mattpocock/skills/ | 同上 |
| | triage | mattpocock/skills/ | 同上 |

### 2.1 安装自定义 Skill（必装，无需询问）

**源路径**：
```
D:/claudeProjects/harness-skill-analysis/docs/paradigm/skills/
  ├── pre-pr-check/SKILL.md
  ├── tech-debt-scan/SKILL.md
  ├── multi-model-review/SKILL.md
  └── sop-from-master/SKILL.md
```

**操作**：Read 源文件 → Write 到目标项目的 `.claude/skills/<name>/SKILL.md`。

### 2.2 搜索并安装 Superpowers Skill（推荐）

**搜索路径**（按优先级）：
1. 用户全局 Skills：`~/.claude/skills/<skill-name>/SKILL.md`
2. 本地 Superpowers 仓库：`D:/claudeProjects/harness-skill-analysis/repos/superpowers/skills/<skill-name>/SKILL.md`

对每个 Superpowers Skill（brainstorming、writing-plans、subagent-driven-development、executing-plans）：

```
1. 搜索以上路径（用 Read 或 Glob 检查文件是否存在）
2. 找到 → 复制到 .claude/skills/<name>/SKILL.md，输出 "✅ brainstorming（从 <来源路径> 安装）"
3. 找不到 → 输出 "⚠️ brainstorming 未找到本地副本，建议从 https://github.com/obra/superpowers 获取。
   需要我跳过还是等你安装后再继续？"
```

### 2.3 搜索并安装 Matt Pocock Skill（推荐）

**搜索路径**（按优先级）：
1. 用户全局 Skills：`~/.claude/skills/<skill-name>/SKILL.md`
2. 本地 Matt Pocock 仓库：`D:/claudeProjects/harness-skill-analysis/repos/mattpocock/skills/engineering/<skill-name>/SKILL.md`
   - 注意：tdd/diagnose/triage 在 `skills/engineering/` 子目录下，code-review 在 `skills/in-progress/review/` 下

对每个 Matt Pocock Skill（tdd、diagnose、code-review、triage）：

```
1. 搜索以上路径（用 Read 或 Glob 检查文件是否存在）
2. 找到 → 复制到 .claude/skills/<name>/SKILL.md，输出 "✅ tdd（从 <来源路径> 安装）"
3. 找不到 → 输出 "⚠️ tdd 未找到本地副本，建议从 https://github.com/mattpocock/skills 获取。
   需要我跳过还是等你安装后再继续？"
```

### 2.4 输出安装报告

```markdown
## Skill 安装报告

### ✅ 已安装
| Skill | 来源 | 类型 |
|-------|------|------|
| pre-pr-check | 本范式 | 自定义 |
| ... | ... | ... |

### ⚠️ 未安装（找不到本地副本）
| Skill | 获取方式 |
|-------|---------|
| ... | ... |

👉 未安装的 Skill 不阻塞初始化。可以在初始化完成后手动补充。
```

**注意**：找不到的 Skill 不阻塞初始化。继续进入 Phase 2.5。

---

## Phase 2.5: 生成 Knowledge 四文档

> **[AI-AUTO] 基于 Phase 0 的环境检测结果，预填充 DDD 四文档。**
> 模板源路径: `D:/claudeProjects/harness-skill-analysis/docs/paradigm/templates/knowledge/`

### 2.5.1 生成 PRODUCT.md

**模板**：`templates/knowledge/PRODUCT.md.tmpl`
**AI 自动填充**：项目名、用户群体（从项目类型推测）
**保留为 [HUMAN-NEEDED]**：核心问题、业务规则、质量标准

### 2.5.2 生成 TECH.md

**模板**：`templates/knowledge/TECH.md.tmpl`
**AI 自动填充**：技术栈（从 Phase 0 检测结果）
**保留为 [HUMAN-NEEDED]**：ADR 记录、接口契约

### 2.5.3 生成 IMPROVEMENT.md

**模板**：`templates/knowledge/IMPROVEMENT.md.tmpl`
**AI 自动填充**：优先级（从 Phase 3 的 tech-debt 扫描结果中提取 top-3）
**保留为 [HUMAN-NEEDED]**：禁止事项、中远期改进方向

### 2.5.4 生成 PROJECT.md

**模板**：`templates/knowledge/PROJECT.md.tmpl`
**AI 自动填充**：当前阶段（从 git history 推测）、进行中/待办（从 git log 和分支推测）
**保留为 [HUMAN-NEEDED]**：阻塞事项确认

---

## Phase 2.6: 生成 Governance 骨架

> **[AI-AUTO] 生成三层治理的初始骨架。Principles 用 Starter 模板，团队共识后替换。**

### 2.6.1 生成 principles.md

**模板**：`templates/governance/principles.md.tmpl`
**AI 自动填充**：根据 Phase 0 检测的项目类型，从模板的"Starter Principles 参考"中选择 3 条最匹配的。例如：
- 后端项目 → P_完成度 + P_可追溯 + P_数据质量
- 前端项目 → P_完成度 + P_可追溯 + P_用户可见
**保留为 [HUMAN-NEEDED]**：团队必须确认/修改/替换这 3 条 Starter Principles

### 2.6.2 为已有 rules 添加 Principle 追溯

检查 `.claude/rules/architecture.md` 和 `.claude/rules/coding-standards.md`（如已从模板生成），在文件头部添加：
```markdown
> **追溯 Principle**: ___（团队共识后填写）
```
这样当 principles 确定后，所有 rules 都有明确的追溯链。

### 2.6.3 生成示例 rule 模板

**模板**：`templates/governance/rules/R001-template.md.tmpl`
**操作**：复制到 `governance/rules/R001-example.md`，作为团队后续从 corrections 蒸馏新 rule 时的参考模板。标注 `[HUMAN-NEEDED]`。

---

## Phase 2.7: 生成 Hooks + Eval

> **[AI-AUTO] 生成 Session 生命周期 hook 和行为验证基础设施。**

### 2.7.1 生成 SessionStart Hook

**模板**：`templates/hooks/on-session-start.sh.tmpl`
**操作**：复制到 `hooks/on-session-start.sh`，替换 `{{PROJECT_NAME}}`。
```bash
chmod +x hooks/on-session-start.sh
```

### 2.7.2 生成 SessionEnd Hook

**模板**：`templates/hooks/on-session-end.sh.tmpl`
**操作**：复制到 `hooks/on-session-end.sh`，替换 `{{PROJECT_NAME}}`。
```bash
chmod +x hooks/on-session-end.sh
```

### 2.7.3 生成 Eval 行为契约

**模板**：`templates/eval/golden-set.md.tmpl`
**操作**：复制到 `eval/golden-set.md`。
**保留为 [HUMAN-NEEDED]**：团队讨论后填写项目特定的行为契约。

### 2.7.4 更新 .claude/settings.json 注册 Hooks

**模板**：`templates/.claude/settings.json.tmpl`
**操作**：
- 如果 `.claude/settings.json` 已有内容，**仅追加 hooks 字段**，保留已有配置
- 如果不存在，直接使用模板创建

---

## Phase 3: 代码库深度分析

> **[AI-AUTO] 基于实际代码扫描，为后续模板填充提供数据。**

### 3.1 提取候选领域术语

1. 列出所有 Entity/Model/Domain 类名
2. 提取类名中的领域名词（去除非领域词如 Service、Controller、Repository）
3. 检查是否存在同一概念的不同命名变体（如 Order vs OrderInfo vs OrderData）
4. 输出候选术语表（含命名冲突标注）

### 3.2 分析现有架构模式

分析 import 依赖关系，识别反模式：
- Controller 直接调用 Repository
- Service 之间循环依赖
- Entity 直接暴露到 Controller
- 工具类承担业务逻辑

### 3.3 检测编码风格模式

抽样 10-15 个代表性文件，分析：
- 命名模式（PascalCase/camelCase/snake_case 一致性）
- 错误处理模式（异常 vs null vs Result 包装，各自占比）
- 数据传递模式（Entity 透传 vs DTO 转换）
- 测试覆盖率（如有测试）

### 3.4 生成初始技术债清单

自动检测（无需人类确认）：
- 超过行数限制的文件和函数（>50行函数, >500行文件）
- 空 catch 块
- 循环内数据库调用（N+1 风险）
- 硬编码 IP/URL/密码模式
- 拼音命名或单字母变量

按 P0/P1/P2 初步分级输出清单。

⚠️ P0/P1 最终需人类在 Phase 5 确认。

---

## Phase 4: 生成项目文件

> **[AI-AUTO] 基于模板 + Phase 3 分析结果生成项目实际文件。**
> 模板源路径: `D:/claudeProjects/harness-skill-analysis/docs/paradigm/templates/`

### 4.1 生成 CLAUDE.md

**模板**：`templates/CLAUDE.md.tmpl`
**AI 自动填充**：项目名、技术栈、框架、数据库、关键依赖（从 Phase 0 提取）
**保留为 [HUMAN-NEEDED]**：分层规则、模块职责、命名规范、测试策略

### 4.2 生成 CONTEXT.md

**模板**：`templates/CONTEXT.md.tmpl`
**AI 自动填充**：Phase 3.1 的候选术语表填入 `{{AI_GENERATED_CANDIDATES}}`
**保留为 [HUMAN-NEEDED]**：术语精确定义、状态机、实体关系、歧义决议

### 4.3 生成 .claude/tech-debt.md

**模板**：`templates/tech-debt.md.tmpl`
**AI 自动填充**：Phase 3.4 的初步扫描结果
**保留为 [HUMAN-NEEDED]**：P0/P1 最终确认、"顺带业务需求"匹配

### 4.4 生成 .claude/rules/architecture.md

**模板**：`templates/rules/architecture.md.tmpl`
**AI 自动填充**：根据技术栈选择对应的分层示例
**保留为 [HUMAN-NEEDED]**：分层规则、包命名、外部依赖规则

### 4.5 生成 .claude/rules/coding-standards.md

**模板**：`templates/rules/coding-standards.md.tmpl`
**AI 自动填充**：根据 Phase 3.3 的代码风格分析预填当前团队实际模式
**保留为 [HUMAN-NEEDED]**：阈值参数（函数行数、文件行数）、严格规则开关

### 4.6 更新 .claude/settings.json

如果文件已存在，**仅追加 Skill 注册**，不修改已有配置。如不存在则创建最小配置。

### 4.7 输出生成报告

```markdown
## Phase 4 完成：文件生成报告

### ✅ 已创建/更新（AgentOS 模块）
| 文件 | 状态 | AI 填充度 |
|------|------|----------|
| knowledge/PRODUCT.md | ✅ | 30%（项目名已填，核心问题待人类确认） |
| knowledge/TECH.md | ✅ | 50%（技术栈已填，ADR待人类确认） |
| knowledge/IMPROVEMENT.md | ✅ | 20%（待 Phase 3 分析后回填） |
| knowledge/PROJECT.md | ✅ | 40%（git 状态已推测，待人类确认） |
| governance/principles.md | ✅ | 60%（3条Starter已选，待人类确认/替换） |
| governance/rules/R001-example.md | ✅ | 0%（模板复制，待从corrections蒸馏） |
| hooks/on-session-start.sh | ✅ | 已可执行 |
| hooks/on-session-end.sh | ✅ | 已可执行 |
| eval/golden-set.md | ✅ | 40%（通用条款已填，项目特定待人类） |
| corrections.log | ✅ | 空文件就绪 |

### ✅ 已创建/更新（原有模块）
| 文件 | 状态 | AI 填充度 |
|------|------|----------|
| CLAUDE.md | ✅ | 60%（技术栈+Skills已填，架构规范待人类确认） |
| CONTEXT.md | ✅ | 30%（候选术语已填，定义待人类确认） |
| .claude/tech-debt.md | ✅ | 70%（债务已列出，优先级待人类确认） |
| .claude/rules/architecture.md | ✅ | 40%（默认建议已填，具体规则待人类确认） |
| .claude/rules/coding-standards.md | ✅ | 50%（已根据代码风格预填，待人类确认） |
| .claude/skills/* | ✅ | 100%（Skill已安装） |

### ⚠️ 待人类处理
- AgentOS 和原有模块共 N 处 `[HUMAN-NEEDED]` 标记
- P0/P1 债务清单待确认
- Starter Principles 待团队共识会议确认

👉 进入 Phase 5（需人类参与）...
```

---

## Phase 5: [HUMAN-NEEDED] 团队共识会议

> **⚠️ AI 在此阶段的工作：整理待决策清单 + 提供决策建议 + 等待人类输入。**

### 5.1 AI 整理待决策清单

从所有生成的文件中提取 `[HUMAN-NEEDED]` 标记，汇总为结构化的**共识会议议程**：

```markdown
# 团队 AI Coding 共识会议议程

## 会议目标
对齐团队对架构、编码规范、领域语言的共识，填入 AI 可执行的约束文件。
预计耗时：2-3 小时（可分两次开）

## 议程 1: 架构分层共识（30 min）
待决策：采用几层架构 / 各层职责边界 / 禁止的依赖方向
AI 建议（基于代码分析）：[列出当前架构问题和建议方案]

## 议程 2: 编码规范共识（45 min）
待决策：函数行数上限 / 文件行数上限 / 错误处理策略 / 命名统一
AI 建议（基于代码分析）：[列出当前风格不一致的地方和统一建议]

## 议程 3: 领域语言共识（30 min）
待决策：确认/修正/删除候选术语 / 补充遗漏术语 / 解决命名冲突
AI 已提取：[列出 Phase 3.1 的候选术语表]

## 议程 4: 技术债优先级确认（30 min）
待决策：P0/P1 最终确认 / 匹配顺带业务需求
AI 建议：[列出 Phase 3.4 的 P0/P1 清单]

## 议程 5: 团队工作流约定（15 min）
待决策：Pre-PR Check 是否强制 / 多模型 Review 触发条件 / 测试策略

## 议程 6: Principles 共识（20 min）★ AgentOS 新增
待决策：确认/修改/替换 AI 建议的 3-5 条原则
目标产出：每条 principle 可判定 + 有"自检"问题（删除它 agent 会犯什么错？）
参考：`governance/principles.md` 中的 Starter Principles
```

### 5.2 AI 等待人类输入

```
📋 共识会议议程已生成。
请团队按议程开会讨论，达成共识后告诉我结论。
你可以逐项告诉我决策结果，也可以一次性告诉我所有决策。
```

### 5.3 AI 接收人类决策并写入文件

人类逐项或批量告知决策后，AI 逐项更新所有生成文件中的 `[HUMAN-NEEDED]` 标记。

---

## Phase 6: 共识落地与一致性验证

> **[AI-AUTO] 人类输入共识后，AI 自主完成收尾。**

### 6.1 移除所有 [HUMAN-NEEDED] 标记

用人类输入的决策内容替换所有 `[HUMAN-NEEDED]` 占位符。

### 6.2 一致性验证

检查文件间规则是否矛盾：
- CLAUDE.md vs .claude/rules/architecture.md 的分层规则一致性
- CLAUDE.md vs .claude/rules/coding-standards.md 的规范一致性
- CONTEXT.md vs CLAUDE.md 的术语一致性
- tech-debt.md 中的问题是否能被现有规则所约束

### 6.2b AgentOS 模块一致性验证（新增）

检查 AgentOS 模块的完整性：
- [ ] `governance/principles.md` 中的每条 principle 是否可判定？（能回答"做到了没有"）
- [ ] `.claude/rules/` 中的每个 rule 是否都有 Principle 追溯行？
- [ ] `knowledge/` 四文档是否都存在且没有空占位符？
- [ ] `hooks/on-session-start.sh` 和 `hooks/on-session-end.sh` 是否可执行？
- [ ] `.claude/settings.json` 中是否已注册 SessionStart 和 SessionEnd hook？
- [ ] `corrections.log` 是否存在？
- [ ] `governance/principles.md` 中的 starter principles 与项目类型是否匹配？

### 6.3 规则可执行性验证

对每条规则做"AI 可执行性检查"：
- ❌ 模糊规则："做好错误处理" → 无法执行
- ✅ 可执行规则："所有 Service 方法必须 try-catch 外部调用，重新抛出时必须保留 cause"

对模糊规则标注修改建议。

### 6.4 输出最终初始化报告

```markdown
# 🎉 AI Coding 范式初始化完成

## 已就绪
- ✅ 5 层范式架构已部署
- ✅ 4 个自定义 Skill 已安装
- ✅ 技术债已记录（P0: N, P1: N, P2: N）
- ✅ 团队共识已写入约束文件

## 下一步

### 立即可以做
1. 在新需求上试用 /pre-pr-check
2. 修复一个 P0 技术债，主R打样 → /sop-from-master
3. 其他成员用 SOP 在新模块上复用

### 本周内
- 所有人试用一次 /pre-pr-check
- 修复至少 1 个 P0 债务
- 完成 1 次 主R打样→SOP生成→全组复用的闭环

### 两周内
- P0 清零
- Pre-PR Check 拦截数据建立度量基线

---
范式源文件: D:/claudeProjects/harness-skill-analysis/docs/paradigm/
```

---

## 附录 A: 文件对照表

### AgentOS 模块模板（新增）
| 范式源文件 | 目标项目文件 | 生成方式 |
|-----------|-------------|---------|
| `templates/knowledge/PRODUCT.md.tmpl` | `knowledge/PRODUCT.md` | AI 基于模板 + Phase 0 检测预填充 |
| `templates/knowledge/TECH.md.tmpl` | `knowledge/TECH.md` | AI 基于模板 + 技术栈自动填充 |
| `templates/knowledge/IMPROVEMENT.md.tmpl` | `knowledge/IMPROVEMENT.md` | AI 基于模板 + Phase 3 债务扫描 |
| `templates/knowledge/PROJECT.md.tmpl` | `knowledge/PROJECT.md` | AI 基于模板 + git history 推测 |
| `templates/governance/principles.md.tmpl` | `governance/principles.md` | AI 选择 3 条 Starter + 人类确认 |
| `templates/governance/rules/R001-template.md.tmpl` | `governance/rules/R001-example.md` | AI 复制为参考模板 |
| `templates/hooks/on-session-start.sh.tmpl` | `hooks/on-session-start.sh` | AI 复制 + `chmod +x` |
| `templates/hooks/on-session-end.sh.tmpl` | `hooks/on-session-end.sh` | AI 复制 + `chmod +x` |
| `templates/eval/golden-set.md.tmpl` | `eval/golden-set.md` | AI 基于模板 + 人类补项目特定 |
| `templates/.claude/settings.json.tmpl` | `.claude/settings.json`（追加 hooks） | AI 读现有 + 追加 hooks 字段 |

### 原有模板（保持不变）
| 范式源文件 | 目标项目文件 | 生成方式 |
|-----------|-------------|---------|
| `templates/CLAUDE.md.tmpl` | `CLAUDE.md` | AI 基于模板生成（AgentOS bootstrap 风格） |
| `templates/CONTEXT.md.tmpl` | `CONTEXT.md` | AI 基于模板生成 + 候选术语预填充 |
| `templates/tech-debt.md.tmpl` | `.claude/tech-debt.md` | AI 扫描生成 + 人类确认优先级 |
| `templates/rules/architecture.md.tmpl` | `.claude/rules/architecture.md` | AI 基于模板 + 技术栈适配 + 人类填共识 |
| `templates/rules/coding-standards.md.tmpl` | `.claude/rules/coding-standards.md` | AI 基于模板 + 代码风格预填充 + 人类确认 |
| `skills/pre-pr-check/SKILL.md` | `.claude/skills/pre-pr-check/SKILL.md` | AI 直接复制 |
| `skills/tech-debt-scan/SKILL.md` | `.claude/skills/tech-debt-scan/SKILL.md` | AI 直接复制 |
| `skills/multi-model-review/SKILL.md` | `.claude/skills/multi-model-review/SKILL.md` | AI 直接复制 |
| `skills/sop-from-master/SKILL.md` | `.claude/skills/sop-from-master/SKILL.md` | AI 直接复制 |

## 附录 B: AI 执行行为准则

在执行本初始化指令时，AI 必须遵守：

1. **遇到 [HUMAN-NEEDED] 立即停止**：不得自行猜测或编造团队共识
2. **备份不覆盖**：已有文件在覆盖前必须备份（`.bak.{date}` 后缀）
3. **只追加不删除**：`.claude/settings.json` 只追加 Skill 注册
4. **用分析结果说话**：所有预填充基于实际代码扫描，标注来源
5. **不评价人的代码**：扫描出债务时只陈述事实
6. **输出可操作**：每个输出包含具体的下一步操作指令
