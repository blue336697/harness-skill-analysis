# SWE-agent 架构分析
> [github.com/SWE-agent/SWE-agent](https://github.com/SWE-agent/SWE-agent) | ~20K Stars | Python | MIT

## 定位
Princeton + Stanford 研究项目，"让 LLM 自主使用工具修复真实 GitHub Issue。" NeurIPS 2024 发表。SWE-bench 基准测试的**起源项目**。

## 架构
**单一 YAML 配置驱动。** "Simple & hackable by design"。

**关键转变**: 开发焦点已转移到 **mini-SWE-agent**——仅 100 行 Python，达到 65% SWE-bench Verified，与完整 SWE-agent 性能持平。

```
SWE-agent 1.0 + Claude 3.7 → SWE-bench Verified SoTA (Feb 2025)
mini-SWE-agent + Claude Sonnet 4.6 → 74% SWE-bench Verified (有报告称)
```

## Agent 循环
- 输入: GitHub Issue URL
- 输出: 工作补丁 (patch)
- 设计原则: "Free-flowing & generalizable — 给 LM 最大自主权"
- 无固定工作流管线——Agent 自主决定每一步

## 工具系统
页面未详细描述。EnIGMA 引用提到 "summarizer, interactive commands" 和网络安全工具。

## 上下文管理
页面未描述。学术论文中可能有详细说明。

## EnIGMA 模式
CTF (Capture The Flag) 网络安全挑战——多基准测试上取得 SoTA。

## 核心差异
| 维度 | 特点 |
|------|------|
| 学术性 | NeurIPS 2024, Princeton+Stanford |
| 起源 | SWE-bench 基准测试的创造者 |
| 简洁性 | mini-SWE-agent 仅100行Python |
| 输入 | GitHub Issue URL → 自动修复 |
| 自主性 | 给 LM 最大自主权(Free-flowing) |
| 安全 | EnIGMA CTF 模式 |
| 许可 | MIT |

## 不适合
- 日常开发（研究工具，非日常驾驶）
- IDE 集成（无插件，仅 CLI）
- 流式输出（无）
