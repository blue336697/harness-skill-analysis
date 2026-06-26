# Qwen Code 架构分析
> [github.com/QwenLM/qwen-code](https://github.com/QwenLM/qwen-code) | ~25K Stars | Python | Apache 2.0

## 定位
阿里官方，"终端里的开源 AI Agent"，专为 Qwen-Coder 模型设计。基于 Google Gemini CLI 改造。**框架和 Qwen3-Coder 模型都是开源的，共同演进。**

## 架构
三种运行模式:
- **交互模式** (`qwen`) — TUI，`@` 引用本地文件
- **无头模式** (`qwen -p "..."`) — 脚本/CI
- **守护进程模式** (`qwen serve`) — ACP over HTTP+SSE，多客户端共享单 Agent

SDK: TypeScript / Python / Java

## Skill/Command
- Skill 系统: `.qwen/skills/` 目录，有 `SKILL.md` 文件
- 内置: Skills + SubAgents
- Slash 命令: `/help`, `/clear`, `/compress`(压缩历史), `/stats`, `/bug`, `/exit`, `/auth`, `/model`

## 上下文管理
- `@path` 文件引用 — 引入本地文件到上下文
- `/compress` — 手动压缩历史节省 token
- `contextWindowSize` — 可配置（默认 131072）
- 守护进程模式 — 共享会话状态

## 多协议供应商
支持 OpenAI / Anthropic / Gemini 兼容 API + 阿里云 Coding Plan / OpenRouter / Fireworks AI + 自定义密钥。**一个 `settings.json` 管理全部。**

## 平台
macOS / Linux / Windows + 桌面应用 (Qwen Code Desktop) + VS Code / Zed / JetBrains 集成

## 核心差异
| 维度 | 特点 |
|------|------|
| 模型绑定 | 专为 Qwen-Coder 优化（但支持多供应商） |
| 开源程度 | 框架 + 模型 双开源 |
| 守护进程 | ACP over HTTP+SSE 单Agent多客户端 |
| 免费层 | 曾每日100次免费，2026年4月已停止 |
| 本地模型 | Ollama/vLLM 支持（无需云账号） |
