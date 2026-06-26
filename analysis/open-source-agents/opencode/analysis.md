# OpenCode 架构分析
> [github.com/anomalyco/opencode](https://github.com/anomalyco/opencode) | ~172K Stars | Rust | MIT

## 定位
"开源的 AI 编码 Agent。" 终端 + 桌面应用双入口。14,151 commits, 824 releases——最成熟的纯开源 Agent 项目。

## 架构
Monorepo (Turborepo + Bun) + SST 基础设施 + Nix flake。
- `packages/` — 模块化包架构
- `sdks/vscode` — VS Code 扩展
- `.opencode/` — 项目配置
- `AGENTS.md` + `CONTEXT.md` — Agent 定义+上下文
- 语言: TypeScript 68.8%, MDX 27.6%, CSS 3.1%

## Agent 循环
**双 Agent 模式**（Tab 键切换）:
| Agent | 权限 | 用途 |
|-------|------|------|
| **build** | 全访问（文件编辑+命令执行） | 日常开发 |
| **plan** | 只读（文件编辑默认拒绝，命令需批准） | 分析和代码探索 |
| **@general** | 子代理 | 复杂搜索和多步骤任务 |

## 上下文管理
- `CONTEXT.md` — 项目上下文定义文件
- `AGENTS.md` — Agent 行为配置
- `.opencode/` — 项目级配置目录

## 核心差异
| 维度 | 特点 |
|------|------|
| Stars | 172K（最高之一） |
| 接口 | TUI + 桌面应用 (Beta) |
| 安装方式 | 12+ 包管理器 (npm/bun/pnpm/Homebrew/Scoop/Chocolatey/Pacman/AUR/Mise/Nix) |
| 多语言 | README 翻译为 22+ 语言 |
| Agent 模式 | build/plan 双模式 + @general 子代理 |
| 成熟度 | 824 releases, 14K+ commits |
| 许可 | MIT |
