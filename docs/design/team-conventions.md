# 团队 Claude Code 协作开发约定

> 团队使用 Claude Code 进行协作开发的完整规范。
> 覆盖 Git 工作流、Code Review、Agent 使用、知识管理、新成员接入。
> 本约定假设项目已按 [CLAUDE.md 层次化设计](claude-md-hierarchical-design.md) 和 [Skills 组合方案](skills-combination-plan.md) 完成初始化。

## 一、Git 工作流

### 1.1 分支策略

```
main
  ├── feature/<描述>          ← 新功能
  ├── fix/<描述>              ← Bug 修复
  ├── refactor/<描述>         ← 重构
  └── chore/<描述>            ← 工程化改进
```

| 规则 | 内容 |
|------|------|
| **起点** | 所有分支从 `main` 拉出 |
| **命名** | 小写英文，`-` 连接，不超过 3 个词 |
| **粒度** | 一个分支 = 一个 Issue / 一个功能点 |
| **禁止** | "杂项修复"分支（一个分支解决多个不相关问题） |
| **合并后** | 立即删除分支 |

### 1.2 Agent 分支标识

Agent 创建的分支加 `agent/` 前缀：

```
agent/fix-login-timeout      ← Agent 自主修复
feature/payment-v2           ← 人工发起
```

通过前缀区分可追溯每个提交的发起者。

### 1.3 Commit 格式

```
<type>: <描述>

<可选正文，解释原因和影响范围>
```

| Type | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加用户登录日志` |
| `fix` | Bug 修复 | `fix: 修复并发请求时 session 丢失` |
| `refactor` | 重构（不改变行为） | `refactor: 提取认证逻辑为独立模块` |
| `docs` | 文档 | `docs: 更新 API 使用说明` |
| `test` | 测试 | `test: 补充支付流程集成测试` |
| `chore` | 工程化 | `chore: 升级依赖版本` |
| `perf` | 性能优化 | `perf: 优化列表查询索引` |

**粒度规则**：

```
一个 Commit = 一个可独立回滚的逻辑变更
所有 Commit 必须能通过测试

禁止：
  - "WIP" / "暂存" 类 Commit
  - 一个 Commit 包含多个不相关修改
  - 包含 console.log / 调试代码的 Commit
```

### 1.4 Agent 参与记录

Agent 生成的 PR 在描述中标注参与信息：

```markdown
## Agent 参与
- **模型**: Claude Opus 4.8 (via Claude Code)
- **Skill**: /diagnose → /tdd → /code-review
- **人工审查**: 已通过
```

### 1.5 PR 流程

```
1. 开发完成 → 全测试通过 → Agent code-review
2. 修复 CRITICAL 和 HIGH 问题
3. git push → 创建 PR
4. PR 描述必须包含：做了什么、为什么、Agent 参与、测试方法
5. 至少一个人类审查者批准
6. CI 全绿
7. 合并
```

---

## 二、Code Review 流程

### 2.1 两级审查

```
第一级：Agent Review（自动，每次修改后）
  ├── 安全扫描：密钥、注入、权限
  ├── 代码质量：函数长度、嵌套深度、错误处理
  └── 产出：CRITICAL / HIGH / MEDIUM / LOW 分级

第二级：人工 Review（手动，PR 阶段）
  ├── 架构合理性
  ├── 业务逻辑正确性
  └── 可维护性
```

### 2.2 严重级别处理

| 级别 | 标签 | 处理 |
|------|------|------|
| **CRITICAL** | 安全漏洞、数据丢失 | **阻塞合并**，必须修复 |
| **HIGH** | 明确 Bug、重大质量问题 | **应该修复**，合并前处理 |
| **MEDIUM** | 可维护性问题 | **考虑修复** |
| **LOW** | 风格偏好 | **可选修复** |

### 2.3 人工 Review Checklist

- [ ] 变更符合该模块 CLAUDE.md 约定？
- [ ] 跨模块影响是否已更新相关 CLAUDE.md？
- [ ] 业务逻辑正确？
- [ ] 错误处理完整？
- [ ] 无性能退化？
- [ ] Agent Review 的 CRITICAL/HIGH 已全部修复？

---

## 三、Agent 使用规范

### 3.1 自主操作（无需确认）

| 操作 | 条件 |
|------|------|
| 代码搜索和阅读 | 无限制 |
| 单文件修改 | 修改后触发 code-review |
| 同模块多文件修改 | 修改前后均需 code-review |
| Bug 诊断 | 使用 /diagnose |
| 测试编写 | 使用 /tdd，先写失败测试再实现 |
| 代码审查 | 使用 /code-review |
| 文档/CLAUDE.md 更新 | 仅更新受影响的文件 |
| `git add` + `git commit` | 按 Commit 格式 |

### 3.2 需确认操作

| 操作 | 条件 |
|------|------|
| `git push` | 需人工确认 |
| 修改 `.claude/settings.json` | 需人工确认并审查 |
| 添加外部依赖 | 需人工确认 |
| 大规模重构（> 10 文件） | 需人工确认 + 走 /brainstorming + /writing-plans |
| 删除文件 | 需人工确认 |

### 3.3 禁止操作

| 操作 | 原因 |
|------|------|
| `git push --force` | git-guardrails 拦截 |
| `git reset --hard` | git-guardrails 拦截 |
| `git branch -D` | git-guardrails 拦截 |
| 发布/部署 | 仅人工操作 |

### 3.4 子代理使用规则

```
使用子代理：
✓ 并行读取多个不相关的文件
✓ 执行多个独立的并行搜索
✓ 并行运行隔离良好的测试套件

不使用子代理：
✗ 依赖上下文顺序的连续操作
✗ 单文件的简单修改
✗ 代码风格不明的修改
```

---

## 四、知识管理

### 4.1 CLAUDE.md 维护触发条件

| 触发 | 动作 |
|------|------|
| 新增模块 | 创建模块 CLAUDE.md + 更新父级索引 |
| 修改架构决策 | 更新根 CLAUDE.md 架构决策部分 |
| 新增外部依赖 | 更新 CLAUDE.md 环境与工具部分 |
| 模块职责变更 | 更新模块 CLAUDE.md 领域模型部分 |
| 技术栈升级 | 更新语言层 CLAUDE.md |

### 4.2 ADR（架构决策记录）

位置：`docs/adr/adr-NNN-主题.md`

```markdown
# ADR-001: 选择 PostgreSQL 而非 MongoDB

- **日期**: 2026-06-15
- **状态**: 已接受
- **决策**: PostgreSQL 为主数据库
- **背景**: 需要强一致性事务支持
- **结果**: 所有服务用 PostgreSQL，通过 Prisma ORM 访问
- **影响**: src/db/, src/models/
```

### 4.3 CONTEXT.md（领域语言）

位置：项目根目录 `CONTEXT.md`

```markdown
# 领域语言

## 术语
- **订单** (Order)：用户提交的购买请求。
  生命周期：pending → confirmed → shipped → delivered

## 关系
- Order → Customer（多对一）
- Order → Product（多对多）

## 歧义记录
- "用户" 统一指 Customer，不含 Admin（2026-05 决议）
```

### 4.4 .claude/rules/ 维护

- 交叉性规则放 `.claude/rules/`
- 变更需在 PR 中说明原因
- 废弃规则即时移除

---

## 五、Skills 生命周期

### 5.1 新增 Skill

1. **查重**：检查四个 Harness 项目是否已有类似 Skill
2. **复用优先**：优先直接使用或适配现有 Skill
3. **自行开发**：用 `/write-a-skill` 创建
4. **团队评审**：至少一次实际使用验证后方可纳入规范

### 5.2 安装位置

| Skill 类型 | 位置 | 理由 |
|-----------|------|------|
| 团队通用 | `~/.claude/skills/` | 跨项目可用 |
| 项目特定 | `<project>/.claude/skills/` | 仅当前项目 |
| 实验性 | `<project>/.claude/skills/` | 验证后按需提升 |

### 5.3 Skill 文档要求

- `SKILL.md`：核心流程（< 500 行）
- 在项目根 CLAUDE.md 的 Skill 策略中注册

---

## 六、新成员接入

### 6.1 人工接入

- [ ] 安装 Claude Code CLI
- [ ] 克隆项目仓库
- [ ] 安装项目 Skills（按当前阶段）
- [ ] 配置 `~/.claude/rules/` 个人规则
- [ ] 阅读项目 CLAUDE.md 体系（从根逐层向下）
- [ ] 阅读 CONTEXT.md
- [ ] 在子目录启动 Claude Code，问 "你加载了哪些项目约定？"
- [ ] 完成一个 onboarding Issue

### 6.2 项目首次 Agent 接入

- [ ] 创建根 CLAUDE.md（按层次化模板）
- [ ] 创建各层 CLAUDE.md
- [ ] 创建 `.claude/rules/` 交叉规则
- [ ] 配置 SessionStart Hook
- [ ] 安装阶段一 Skills
- [ ] 创建 CONTEXT.md（如有领域语言）
- [ ] 多目录验证 "你加载了哪些约定？"

---

## 七、场景速查

### 新功能（阶段一）
```
git checkout -b feature/xxx main
→ /brainstorming   → 设计文档
→ /writing-plans   → 实施计划
→ [/to-issues]     → Issue 卡片（可选）
→ subagent-driven-development → 逐任务执行+审查
→ verification-before-completion
→ PR
```

### Bug 修复（阶段二）
```
git checkout -b fix/xxx main
→ /diagnose       → Phase 1: 构建反馈循环 → Phase 2-5 → Phase 6
→ /tdd            → 垂直切片循环
→ /code-review    → 修复 CRITICAL/HIGH
→ git push        → PR
```

### 小需求（阶段二）
```
确认 Issue 已 triage 且标记为 ready-for-agent
→ [/grill-me]     → 需求澄清（可选）
→ /tdd            → 垂直切片循环
→ /code-review
→ git push → PR
```

### 重构
```
git checkout -b refactor/xxx main
→ /improve-codebase-architecture
→ 确保测试通过
→ /code-review
→ PR
```

---

## 八、约定优先级

当多层约定冲突时：

```
用户直接指令 > 模块 CLAUDE.md > 语言层 CLAUDE.md
  > 根 CLAUDE.md > Skill 指令 > .claude/rules/ > 默认行为
```

**原则**：
- 用户始终有最终决定权
- 特定覆盖通用（模块约定 > 项目约定 > 全局约定）
- Skill 提供流程但不绝对强制（HARD-GATE Skill 除外）
