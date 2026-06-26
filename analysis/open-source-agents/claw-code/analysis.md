# Claw Code 架构分析
> [github.com/ultraworkers/claw-code](https://github.com/ultraworkers/claw-code) | ~193K Stars | Python/Rust | MIT

## 定位
Claude Code 的洁净室 Rust 重写。README 自述："一个由 Agent 管理的博物馆展品"。**明确非生产级**。零人类干预开发——Agent 自己开发、测试、维护代码。

## 架构
- `rust/` — Rust workspace, CLI 二进制 `claw`
- `src/` — 配套 Python 参考（非主运行时）
- `.claude/sessions` — 会话持久化
- `CLAUDE.md` + `.claw.json` — 项目上下文+配置
- CLI 命令: `claw doctor`, `claw prompt`, `claw status`, `claw config env`, `claw acp`

## Skill/Command/Hook
**仅最小 CLI 命令集，无 Skill 插件系统，无 PreToolUse/PostToolUse Hook。** 无结构化工作流——Agent 直接通过 prompt 交互。

## 上下文管理
- `docs/navigation-file-context.md` — @path 文件上下文
- 会话持久化目录（无自动压缩,无 Fresh Context,无监控）

## 核心差异
| 维度 | 特点 |
|------|------|
| 生产级 | ❌ 明确不生产 |
| 人类参与 | ❌ 零人类干预开发 |
| 分发 | 仅源码构建 |
| 许可 | MIT（最宽松） |
| 适用 | 学习 CC 架构, Agent 行为研究 |
