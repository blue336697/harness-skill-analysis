# 完全开源的 AI Coding Agent 项目全览

> 来源：[awesome-cli-coding-agents](https://github.com/bradAGI/awesome-cli-coding-agents) 验证（2026-06-08更新）
> 收录标准：GitHub 上完整开源，核心 Agent 循环/工具/Prompt 源码可见
> 排除：Claude Code、Cursor、Windsurf、Devin、GitHub Copilot 等闭源项目

---

## 一、头部 CLI Agent（20K+ Stars）

| 项目 | Stars | 语言 | 许可 | GitHub |
|------|-------|------|------|------|
| Claw Code | ~193K | Python/Rust | MIT | [ultraworkers/claw-code](https://github.com/ultraworkers/claw-code) |
| Hermes Agent | ~187K | Python | — | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) |
| OpenCode | ~172K | Rust | Apache 2.0 | [anomalyco/opencode](https://github.com/anomalyco/opencode) |
| Gemini CLI | ~105K | Go | Apache 2.0 | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) |
| Codex CLI | ~89K | TypeScript | Apache 2.0 | [openai/codex](https://github.com/openai/codex) |
| OpenHands | ~76K | Python | MIT | [All-Hands-AI/OpenHands](https://github.com/All-Hands-AI/OpenHands) |
| Open Interpreter | ~64K | Python | AGPL | [OpenInterpreter/open-interpreter](https://github.com/OpenInterpreter/open-interpreter) |
| Cline | ~63K | TypeScript | Apache 2.0 | [cline/cline](https://github.com/cline/cline) |
| Pi | ~61K | TypeScript | MIT | [badlogic/pi-mono](https://github.com/badlogic/pi-mono) |
| Goose | ~48K | Rust | Apache 2.0 | [block/goose](https://github.com/block/goose) |
| Aider | ~46K | Python | Apache 2.0 | [Aider-AI/aider](https://github.com/Aider-AI/aider) |
| Continue | ~34K | TypeScript | Apache 2.0 | [continuedev/continue](https://github.com/continuedev/continue) |
| Crush | ~25K | Go | MIT | [charmbracelet/crush](https://github.com/charmbracelet/crush) |
| Qwen Code | ~25K | Python | Apache 2.0 | [QwenLM/qwen-code](https://github.com/QwenLM/qwen-code) |
| Roo Code | ~24K | TypeScript | Apache 2.0 | [RooCodeInc/Roo-Code](https://github.com/RooCodeInc/Roo-Code) |
| Kilo Code | ~20K | TypeScript | Apache 2.0 | [Kilo-Org/kilocode](https://github.com/Kilo-Org/kilocode) |
| SWE-agent | ~20K | Python | MIT | [SWE-agent/SWE-agent](https://github.com/SWE-agent/SWE-agent) |
| Plandex | ~15K | Go | Apache 2.0 | [plandex-ai/plandex](https://github.com/plandex-ai/plandex) |
| Trae Agent | ~12K | TypeScript | MIT | [bytedance/trae-agent](https://github.com/bytedance/trae-agent) |
| Codebuff | ~11K | TypeScript | — | [CodebuffAI/codebuff](https://github.com/CodebuffAI/codebuff) |

---

## 二、大厂官方 CLI Agent

| 项目 | 公司 | GitHub |
|------|------|------|
| Gemini CLI | Google | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) |
| Codex CLI | OpenAI | [openai/codex](https://github.com/openai/codex) |
| Qwen Code | 阿里巴巴 | [QwenLM/qwen-code](https://github.com/QwenLM/qwen-code) |
| Trae Agent | 字节跳动 | [bytedance/trae-agent](https://github.com/bytedance/trae-agent) |
| Kimi CLI | Moonshot AI | [MoonshotAI/kimi-cli](https://github.com/MoonshotAI/kimi-cli) |
| Amazon Q CLI | AWS | [aws/amazon-q-developer-cli](https://github.com/aws/amazon-q-developer-cli) |
| Mistral Vibe | Mistral AI | [mistralai/mistral-vibe](https://github.com/mistralai/mistral-vibe) |
| Goose | Block(Square) | [block/goose](https://github.com/block/goose) |
| Hermes Agent | Nous Research | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) |

---

## 三、Claude Code 开源重写（Rust/Python 洁净室实现）

2026年3月 Claude Code 源码分析后涌现的重写项目：

| 项目 | 语言 | GitHub |
|------|------|------|
| Claw Code | Python/Rust | [ultraworkers/claw-code](https://github.com/ultraworkers/claw-code) |
| Claurst | Rust | [Kuberwastaken/claurst](https://github.com/Kuberwastaken/claurst) |
| Free Code | TypeScript | [paoloanzn/free-code](https://github.com/paoloanzn/free-code) |
| claw-code-agent | Python | [HarnessLab/claw-code-agent](https://github.com/HarnessLab/claw-code-agent) |
| Crab Code | Rust | [lingcoder/crab-code](https://github.com/lingcoder/crab-code) |
| NullClaw | — | [nullclaw/nullclaw](https://github.com/nullclaw/nullclaw) |
| ZeroClaw | — | [zeroclaw-labs/zeroclaw](https://github.com/zeroclaw-labs/zeroclaw) |
| IronClaw | — | [nearai/ironclaw](https://github.com/nearai/ironclaw) |
| PicoClaw | — | [sipeed/picoclaw](https://github.com/sipeed/picoclaw) |
| NanoClaw | — | [gavrielc/nanoclaw](https://github.com/gavrielc/nanoclaw) |

---

## 四、纯 Rust 实现（每一行可审计）

| 项目 | Stars | GitHub |
|------|-------|------|
| OpenCode | ~172K | [anomalyco/opencode](https://github.com/anomalyco/opencode) |
| Goose | ~48K | [block/goose](https://github.com/block/goose) |
| Claurst | ~9.8K | [Kuberwastaken/claurst](https://github.com/Kuberwastaken/claurst) |
| g3 | ~510 | [dhanji/g3](https://github.com/dhanji/g3) |
| Octomind | ~71 | [Muvon/octomind](https://github.com/Muvon/octomind) |
| Crab Code | ~69 | [lingcoder/crab-code](https://github.com/lingcoder/crab-code) |
| picocode | ~52 | [jondot/picocode](https://github.com/jondot/picocode) |
| QQCode | ~51 | [qnguyen3/qqcode](https://github.com/qnguyen3/qqcode) |
| Smelt | ~23 | [leonardcser/smelt](https://github.com/leonardcser/smelt) |

---

## 五、纯 Python 实现（最易审计）

| 项目 | 特点 | GitHub |
|------|------|------|
| Aider | Git 优先，自动提交，Architect/Editor 双模型 | [Aider-AI/aider](https://github.com/Aider-AI/aider) |
| SWE-agent | SWE-bench 起源，mini-SWE-agent 仅100行 | [SWE-agent/SWE-agent](https://github.com/SWE-agent/SWE-agent) |
| OpenHands | Docker 沙箱，CI/CD 无头模式，企业功能 | [All-Hands-AI/OpenHands](https://github.com/All-Hands-AI/OpenHands) |
| Open Interpreter | 自然语言操控电脑 | [OpenInterpreter/open-interpreter](https://github.com/OpenInterpreter/open-interpreter) |
| Claude Engineer | 最早的 CC 风格 Agent 之一 | [Doriandarko/claude-engineer](https://github.com/Doriandarko/claude-engineer) |
| RA.Aid | LangGraph 研究→规划→实施管线 | [ai-christianson/RA.Aid](https://github.com/ai-christianson/RA.Aid) |
| claw-code-agent | 零外部依赖，最易阅读 | [HarnessLab/claw-code-agent](https://github.com/HarnessLab/claw-code-agent) |

---

## 六、VS Code / IDE 扩展型

| 项目 | Stars | GitHub |
|------|-------|------|
| Cline | ~63K | [cline/cline](https://github.com/cline/cline) |
| Continue | ~34K | [continuedev/continue](https://github.com/continuedev/continue) |
| Roo Code | ~24K | [RooCodeInc/Roo-Code](https://github.com/RooCodeInc/Roo-Code) |
| Kilo Code | ~20K | [Kilo-Org/kilocode](https://github.com/Kilo-Org/kilocode) |

---

## 七、有学术/研究价值的项目

| 项目 | 价值 | GitHub |
|------|------|------|
| SWE-agent | SWE-bench 起源，NeurIPS 2024 | [SWE-agent/SWE-agent](https://github.com/SWE-agent/SWE-agent) |
| AutoCodeRover | 自动修 GitHub Issue | [AutoCodeRoverSG/auto-code-rover](https://github.com/AutoCodeRoverSG/auto-code-rover) |
| Agentless | 无 Agent 循环的 Issue 修复 | [OpenAutoCoder/Agentless](https://github.com/OpenAutoCoder/Agentless) |
| Darce | 仅 14KB，最小完整 Agent | [AmerSarhan/darce-cli](https://github.com/AmerSarhan/darce-cli) |
| gptme | 最简 Agent 架构参考 | [gptme/gptme](https://github.com/gptme/gptme) |

---

## 八、快速对比

| 项目 | 本地模型 | 自主执行 | Git集成 | MCP | IDE支持 |
|------|:---:|:---:|:---:|:---:|:---:|
| Aider | ✅ | ❌(引导式) | ✅(自动提交) | ❌ | ❌(CLI) |
| Cline | ✅ | ✅ | ✅ | ✅ | ✅(VS Code) |
| OpenHands | ✅ | ✅ | ✅ | ✅ | ✅(Web+CLI) |
| SWE-agent | ✅ | ✅ | ✅ | ❌ | ❌(CLI) |
| Continue | ✅ | ❌(辅助式) | ✅ | ❌ | ✅(IDE) |
| OpenCode | ✅ | ✅ | ✅ | ✅ | ❌(CLI) |
| Codex CLI | ✅ | ✅ | ✅ | ✅ | ❌(CLI) |
| Goose | ✅ | ✅ | ✅ | ✅ | ❌(CLI) |

---

## 九、如何判断"真正全部开源"

| 判断维度 | ✅ 真开源 | ❌ 假开源 |
|----------|---------|----------|
| Agent 循环 | `git clone` 后可见可编译 | 闭源二进制 |
| 工具调用 | 源码可见 | 闭源 |
| Prompt 管理 | 源码可见 | 隐藏 |
| 上下文管理 | 源码可见 | 闭源 |
| 可自行部署 | clone→build→run | 必须付费/注册 |

---

## 十、学习路径

```
1. Darce（14KB, 7工具）→ 理解 Agent 最小骨架
     ↓
2. claw-code-agent（零依赖 Python）→ 理解完整 Agent 循环
     ↓
3. SWE-agent + mini-SWE-agent（100行Python）→ 理解 SWE-bench 工作流
     ↓
4. Claurst / Crab Code（Rust）→ 理解生产级实现
```

> **验证来源**: [awesome-cli-coding-agents](https://github.com/bradAGI/awesome-cli-coding-agents) — 2026-06-08 更新，161个 GitHub 仓库地址全部可点击验证
