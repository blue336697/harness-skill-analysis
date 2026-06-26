# Codex CLI 架构分析
> [github.com/openai/codex](https://github.com/openai/codex) | ~89K Stars | Rust | Apache 2.0

## 定位
OpenAI 官方，"在你电脑上本地运行的轻量级编码 Agent。" 三种产品形态：CLI（此仓库）/ IDE 版 / 云端 Web 版（chatgpt.com/codex）。Rust 实现（96.1%）。

## 架构
Bazel 构建系统 + Nix flake:
- `codex-cli/`, `codex-rs/` — Rust 核心
- `sdk/` — SDK 层
- `tools/` — 工具定义
- `AGENTS.md` — Agent 行为配置
- `.codex/` — 项目配置

## Agent 循环
**页面未披露详细 Agent 循环**。源码在 `codex-rs/` 中。

## Skill/Command/Hook
页面未描述 Skill/Command/Hook 系统。`AGENTS.md` 文件存在但未展示。

## 上下文管理
页面未描述上下文管理策略。

## 核心差异
| 维度 | 特点 |
|------|------|
| 官方性 | OpenAI 官方 |
| 许可 | Apache 2.0 |
| 认证 | ChatGPT 账号登录 (Plus/Pro/Business/Edu/Enterprise) |
| 语言 | 96.1% Rust |
| 构建 | Bazel |
| 平台 | macOS (x86+ARM) / Linux (x86+ARM) / Windows |
| 安装 | curl/PowerShell/npm/Homebrew/二进制下载 |
