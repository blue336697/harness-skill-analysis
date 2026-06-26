# OpenSpec 分析报告

> **仓库**: [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | 53K+ Stars | MIT License
> **定位**: Spec-Driven Development (SDD) — AI 原生的规约驱动开发系统

## 核心理念

**五大原则**: fluid not rigid（灵活非僵化）| iterative not waterfall（迭代非瀑布）| easy not complex（简单非复杂）| brownfield-first（存量优先）| scalable（可扩展）

核心主张: AI 编码前，人类与 AI 先就"构建什么"达成一致。通过轻量级 spec 层消除需求模糊性。

## Skill 结构设计

### Skills 生成机制（独特）
- **编译时生成**: TypeScript 模板 → `openspec init` → SKILL.md 文件
- **运行时查询**: Agent 通过 `openspec instructions --json` 获取结构化指令
- 11 个 Skill 通过 Profile 组织：Core 模式 [propose, explore, apply, sync, archive]

### Artifact DAG 工作流
```
proposal (root)
    ├── specs ────┐
    └── design ───┤
                  ├── tasks
                  └── APPLY
```
- Kahn 算法拓扑排序确定构建顺序
- 状态机: BLOCKED → READY → DONE

## 跨平台支持
支持 **25+** AI Coding 工具（Claude Code, Cursor, Copilot, Codex, Gemini CLI, Windsurf 等），通过统一的 Skill 目录结构 + 工具特定适配器实现。

## 上下文工程
- **双渠道注入**: 编译时(Skill 模板) + 运行时(CLI --json)
- config.yaml 驱动的 context/rules 注入，50KB 限制
- 不使用 CLAUDE.md，完全依赖 Skill 机制

## 质量保障

### 四层验证
1. Schema 验证 (`openspec schema validate`)
2. 变更验证 (`openspec validate --strict`)
3. AI Agent 验证 (completeness/correctness/coherence)
4. Delta Spec 合并验证（操作前验证 pass + 写 pass）

### 回滚机制
- Change 目录自包含，归档前随时删除撤销
- Delta Spec 原子性: 验证 pass 通过后才执行写 pass
- 归档后需手动恢复

## 架构亮点
1. **Schema 驱动的工作流引擎**: YAML Schema + Artifact DAG，完全可定制
2. **Brownfield-first**: Delta spec 而非全量 spec，适配存量项目
3. **操作前验证模式**: 所有副作用操作先验证后执行，保证原子性
