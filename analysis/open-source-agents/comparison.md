# 七大开源 Agent 横向对比

## 基本属性

| | Claw Code | Hermes Agent | OpenCode | Codex CLI | Qwen Code | Trae Agent | SWE-agent |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Stars** | 193K | 187K | 172K | 89K | 25K | 12K | 20K |
| **语言** | Python/Rust | Python | Rust | Rust | Python | TypeScript | Python |
| **许可** | MIT | 未声明 | MIT | Apache 2.0 | Apache 2.0 | MIT | MIT |
| **组织** | 社区 | Nous Research | anomalyco | OpenAI | 阿里巴巴 | 字节跳动 | Princeton |
| **生产就绪** | ❌ | ✅ | ✅ | ✅ | ✅ | ❌(研究) | ❌(研究) |

## 架构对比

| | Agent 循环 | Skill 系统 | Hook 系统 | Slash 命令 | 子代理 |
|---|:---:|:---:|:---:|:---:|:---:|
| Claw Code | 基础(prompt) | ❌ | ❌ | 无 | ❌ |
| Hermes | **自主创建+改进** | ✅(agentskills.io) | ❌ | 15+ | ✅(并行) |
| OpenCode | build/plan 双模式 | ❌ | ❌ | 内置 | ✅(@general) |
| Codex CLI | Rust 源码 | 未披露 | 未披露 | 内置 | 未披露 |
| Qwen Code | 标准循环 | ✅(.qwen/skills) | ❌ | 9个 | ✅(内置) |
| Trae Agent | 步骤循环+YAML | ❌(MCP) | ❌ | 5个 | ❌ |
| SWE-agent | 自主(Free-flow) | ❌ | ❌ | 无 | ❌ |

## 上下文管理

| | 文件引用 | 会话持久化 | 自动压缩 | 跨会话记忆 | 监控 |
|---|:---:|:---:|:---:|:---:|:---:|
| Claw Code | @path | ✅(会话目录) | ❌ | ❌ | ❌ |
| Hermes | Context Files | **FTS5+LLM摘要** | ✅(/compress) | **✅(Honcho)** | ✅(/usage) |
| OpenCode | CONTEXT.md | .opencode/ | 未披露 | ❌ | ❌ |
| Codex CLI | 未披露 | 未披露 | 未披露 | 未披露 | ❌ |
| Qwen Code | @path | 守护进程共享 | ✅(/compress) | ❌ | ❌ |
| Trae Agent | ❌ | ❌(轨迹文件) | ❌ | ❌ | ❌ |
| SWE-agent | ❌ | ❌ | ❌ | ❌ | ❌ |

## 多供应商支持

| | Anthropic | OpenAI | Google | 本地(Ollama) | 其他 |
|---|:---:|:---:|:---:|:---:|:---:|
| Claw Code | ✅ | ❌ | ❌ | ❌ | DeepSeek |
| Hermes | ✅ | ✅ | ✅ | ✅ | **200+**/OpenRouter |
| OpenCode | ✅ | ✅ | ✅ | ✅ | **75+** |
| Codex CLI | ❌ | ✅ | ❌ | ❌ | — |
| Qwen Code | ✅ | ✅ | ✅ | ✅ | 阿里云/OpenRouter |
| Trae Agent | ✅ | ✅ | ✅ | ✅ | Doubao/Azure |
| SWE-agent | ✅ | ✅ | ❌ | ❌ | — |

## 终端/平台

| | CLI | TUI | IDE扩展 | 桌面应用 | Web | 移动 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Claw Code | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Hermes | ✅ | ✅ | ❌ | ❌ | ❌ | ✅(Telegram等) |
| OpenCode | ✅ | ✅ | ✅(VS Code) | ✅(Beta) | ❌ | ❌ |
| Codex CLI | ✅ | ✅ | ✅(IDE版) | ❌ | ✅(Web版) | ❌ |
| Qwen Code | ✅ | ✅ | ✅(VS Code/Zed/JB) | ✅ | ❌ | ❌ |
| Trae Agent | ✅ | 交互式 | ❌ | ❌ | ❌ | ❌ |
| SWE-agent | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## 核心差异化能力

| 项目 | 独一无二的能力 |
|------|------|
| **Hermes Agent** | 🥇 **自主创建+改进 Skill**（封闭学习循环）。跨会话 FTS5+LLM 记忆。6 平台消息网关。200+ 模型。定时 Cron。无服务器休眠。 |
| **OpenCode** | 🥈 172K Stars 最成熟。双 Agent 模式 (build/plan)。桌面应用。12+ 包管理器。22+ 语言 README。824 releases。 |
| **Claw Code** | 193K Stars 最高星。CC 开源重写。MIT。源码可审计。 |
| **Codex CLI** | OpenAI 官方。ChatGPT 账号体系。Rust 生产级。 |
| **Qwen Code** | 阿里官方。模型+框架双开源。守护进程多客户端。 |
| **Trae Agent** | 字节研究。YAML 驱动。Docker 集成。完整轨迹记录。MCP 支持。 |
| **SWE-agent** | SWE-bench 起源。mini-SWE-agent 仅100行。NeurIPS 2024。 |
