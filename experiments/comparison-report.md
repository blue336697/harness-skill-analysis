# 四工程横向对比分析报告

## 实验概述

四个 Harness 工程在相同的需求（TaskFlow API）、代码规范、设计规范下，从0到1完成了功能开发。本报告横向对比四个工程在完整开发周期中的表现。

---

## 一、开发流程对比

| 阶段 | OpenSpec | Superpowers | GSD | Matt Pocock |
|------|----------|-------------|-----|-------------|
| **初始化** | `openspec init` (CLI) | SessionStart Hook | `/gsd-new-project` | `/setup` (手动) |
| **规范建立** | config.yaml | brainstorming 9步 | discuss → CONTEXT.md | grill-with-docs |
| **需求分析** | proposal.md | 设计文档 | discuss-phase | PRD Issue |
| **详细规格** | specs/*.md | 含设计文档中 | spec-phase(可选) | 含PRD中 |
| **技术设计** | design.md | 含设计文档中 | CONTEXT.md | ADR |
| **任务分解** | 34个复选框 | ~30微步骤(含代码) | 依赖波(Dependency Waves) | 垂直切片 |
| **实施** | /opsx:apply(顺序) | subagent-dev(并行) | Wave并行 | /tdd |
| **验证** | /opsx:verify | verify-before-complete | 对话式UAT | 双轴报告 |
| **代码审查** | 无独立步骤 | requesting-review | /gsd-code-review | /review(内建) |
| **完成** | /opsx:archive | finishing-branch | /gsd-ship | /handoff |

### 流程长度
```
OpenSpec:   [初始化]→[提案]→[实施]→[验证]→[归档]  (5步, 最简洁)
Superpowers:[Hook]→[头脑风暴]→[计划]→[子代理]→[TDD]→[审查]→[验证]→[完成] (8步)
GSD:       [Hooks×17]→[项目]→[讨论]→[计划×3]→[执行×n]→[验证]→[审查]→[发布] (8+步, 最复杂)
Matt:      [设置]→[术语]→[PRD]→[问题]→[TDD]→[审查]→[改进]→[交接] (8步)
```

---

## 二、Hook 系统对比

| Hook类型 | OpenSpec | Superpowers | GSD | Matt Pocock |
|----------|----------|-------------|-----|-------------|
| SessionStart | ❌ | ✅ 引导注入 | ✅ (3个) | ❌ |
| PreToolUse | ❌ | ❌ | ✅ (3个守卫) | ✅ (git) |
| PostToolUse | ❌ | ❌ | ✅ (监控+扫描) | ❌ |
| 其他 | ❌ | ❌ | ✅ (SubagentStop/Stop/PreCompact/FileChanged) | ❌ |
| **总计** | **0** | **1** | **17** | **1** |

**关键发现**: GSD是唯一具有深度PreToolUse防护的系统。OpenSpec完全依赖AI自律。

---

## 三、规划模式对比

| 维度 | OpenSpec | Superpowers | GSD | Matt Pocock |
|------|----------|-------------|-----|-------------|
| 粒度 | 34个复选框 | ~30微步骤 | 依赖波 | 垂直切片 |
| 代码 | 无代码 | **每步含完整代码** | 任务描述 | Issue描述 |
| TDD | config声明 | **内置 RED→GREEN** | --tdd标志 | 独立/tdd技能 |
| 占位符 | 无禁止 | **禁止 TBD/TODO** | 不强制 | 不强制 |
| 依赖 | CLI自动DAG | 人工排序 | **自动Wave分析** | 人工Issue依赖 |
| 验证 | 无 | 自查 | **plan-checker(3次)** | 无 |

---

## 四、上下文管理对比

| 维度 | OpenSpec | Superpowers | GSD | Matt Pocock |
|------|----------|-------------|-----|-------------|
| 注入方式 | config.yaml | SessionStart Hook | config.json | CONTEXT.md |
| 子代理上下文 | 共享 | 共享 | **200K 全新** | 共享 |
| 腐烂防护 | 无 | 无 | ✅ | 无 |
| 监控 | 无 | 无 | **上下文监控器** | 无 |

---

## 五、门控与防护

| 机制 | OpenSpec | Superpowers | GSD | Matt Pocock |
|------|----------|-------------|-----|-------------|
| 设计门控 | 无 | **硬门控(HARD-GATE)** | 阶段管道 | disable-model-invocation |
| 编码门控 | 无 | 无 | **PreToolUse 守卫** | git-guardrails |
| 反模式防护 | 无 | 红旗表/铁律 | 角色指令 | 无 |

---

## 六、综合评分 (★ = 1分, 满分5)

| 维度 | OpenSpec | Superpowers | GSD | Matt Pocock |
|------|----------|-------------|-----|-------------|
| 流程完整性 | ★★★ | ★★★★ | ★★★★★ | ★★★★ |
| 门控强度 | ★★ | ★★★★ | ★★★★★ | ★★★ |
| 规划质量 | ★★★★ | ★★★★★ | ★★★★★ | ★★★★ |
| 跨工具支持 | ★★★★★ | ★★★★ | ★★★★ | ★★ |
| 上下文管理 | ★★★ | ★★★ | ★★★★★ | ★★★ |
| 协作友好 | ★★★ | ★★★ | ★★★ | ★★★★★ |
| 学习曲线(低=好) | ★★★★★ | ★★★★ | ★★ | ★★★★ |
| 轻量性 | ★★★★ | ★★★★ | ★ | ★★★★ |
| **综合** | **3.6** | **3.9** | **3.8** | **3.5** |

---

## 七、Skill 中间文件对比

| 工程 | 文件数 | 关键目录 | 核心产物 |
|------|--------|---------|---------|
| OpenSpec | 14 | `openspec/changes/` | config.yaml, proposal/design/specs/tasks + 4技能+4命令 |
| Superpowers | 2 | `docs/superpowers/` | 1设计文档 + 1实施计划(含完整代码) |
| GSD | 6 | `.planning/` | PROJECT/REQUIREMENTS/ROADMAP/STATE/CONTEXT + config.json |
| Matt Pocock | 8 | `.scratch/` + 根目录 | CONTEXT.md + ADR + 1PRD + 5垂直切片问题 |

**OpenSpec**: CLI生成, 模板驱动, 依赖DAG自动计算。4个artifact形成规范链(proposal→design→specs→tasks)。
**Superpowers**: SessionStart注入, 技能自动匹配。2个文件但内容最具体——writing-plans每步含完整代码，零歧义。
**GSD**: 模板系统最完善(40+模板), STATE.md持续追踪进度, CONTEXT.md有22个编号决策供下游agent消费。
**Matt Pocock**: 唯一使用Issue Tracker(.scratch/)作为状态中心, 垂直切片(每Issue端到端), CONTEXT.md仅术语无实现细节。

---

## 八、适用场景建议

**选择 OpenSpec**: 需要支持30+AI工具、偏好CLI驱动、不需要强制门控

**选择 Superpowers**: 想要零配置自动触发、重视设计审批、需要内置TDD+CodeReview

**选择 GSD**: 需要最强安全防护、大型项目(Fresh Context)、Parallel Waves、接受高学习成本

**选择 Matt Pocock**: 使用Issue Tracker协作、重视领域语言一致性、偏好垂直切片、需要架构可视化

---

## 九、核心发现

1. **门控机制是区分四个工程的核心维度**：GSD最强(PreToolUse物理阻止)、Superpowers次之(HARD-GATE行为约束)、OpenSpec最弱(依赖自律)
2. **上下文管理是GSD的独特优势**：Fresh 200K context + context-monitor Hook，其他三个工程未解决此问题
3. **Superpowers的规划最具体**：每步含完整代码，零歧义，最接近"真正可执行"的计划
4. **OpenSpec的跨工具支持无可匹敌**：30+工具的适配器系统
5. **Matt Pocock的Issue Tracker集成独树一帜**：其他三个都用文件系统存储状态
6. **GSD的代价是复杂度**：68命令+33Agent+17Hook，学习曲线最陡
7. **中间文件数量不代表质量**：Superpowers仅2个文件但内容密度最高，OpenSpec的14个文件由CLI自动生成
