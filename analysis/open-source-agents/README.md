# 七大开源 AI Coding Agent 架构分析

分析目标：理解每个项目的 Agent 循环、Skill/Command/Hook 系统、上下文管理机制、以及与其他项目的架构差异。

| # | 项目 | 组织 | Stars | 语言 | 许可 | 定位 |
|---|------|------|-------|------|------|------|
| 1 | Claw Code | ultraworkers | ~193K | Python/Rust | MIT | CC 开源重写，非生产级 |
| 2 | Hermes Agent | Nous Research | ~187K | Python | — | 自我改进，封闭学习循环 |
| 3 | OpenCode | anomalyco | ~172K | Rust | MIT | 通用开源 Agent，TUI+桌面 |
| 4 | Codex CLI | OpenAI | ~89K | Rust | Apache 2.0 | OpenAI 官方，本地运行 |
| 5 | Qwen Code | Alibaba | ~25K | Python | Apache 2.0 | Qwen 模型专用，终端优先 |
| 6 | Trae Agent | ByteDance | ~12K | TypeScript | MIT | 研究导向，模块化架构 |
| 7 | SWE-agent | Princeton | ~20K | Python | MIT | SWE-bench 起源，学术项目 |
