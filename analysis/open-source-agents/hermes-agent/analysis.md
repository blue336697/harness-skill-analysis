# Hermes Agent 架构分析
> [github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | ~187K Stars | Python | Nous Research

## 定位
"自我改进的 AI Agent"——内置封闭学习循环。**自动从经验中创建 Skill、使用中自我改进、跨会话搜索历史建立用户模型。** 支持 200+ 模型，6 种终端后端。

## 架构
```
agent/          ← 核心 Agent 循环
gateway/        ← 消息网关 (Telegram/Discord/Slack/WhatsApp/Signal)
skills/         ← Skill 定义和技能系统
tools/plugins/  ← 工具执行 + 插件架构
providers/      ← LLM 供应商抽象层
hermes_cli/     ← CLI 命令
cron/           ← 定时任务调度
acp_adapter/    ← Agent 通信协议
```

## Skill 系统（最独特）
- **自主创建**: Agent 完成复杂任务后自动创建 Skill
- **自我改进**: Skill 在使用中自动优化
- **存储**: `~/.hermes/skills/`
- **兼容**: agentskills.io 开放标准
- **调用**: `/skill-name` 或浏览 `/skills`

## Slash 命令
`/new`, `/model`, `/personality`, `/retry`, `/undo`, `/compress`(上下文压缩), `/usage`, `/insights`, `/skills`, `/platforms`, `/status`, `/sethome`

## 上下文管理
- **FTS5 全文搜索**: 跨会话搜索历史对话
- **LLM 摘要**: 跨会话回忆
- **Agent 管理的记忆**: 定期提醒持久化
- **Honcho 集成**: 辩证用户建模
- **Context Files**: 项目上下文注入
- `/compress` + `/usage`: 手动压缩+监控

## 定时任务 (Cron)
自然语言定义定时任务: "每天生成报告/每晚备份/每周审计"，无人值守运行。

## 终端后端 (6种)
本地 / Docker / SSH / Singularity / Modal / Daytona
Modal 和 Daytona 支持 **无服务器持久化**——空闲时休眠，唤醒时恢复。

## 多平台消息
Telegram、Discord、Slack、WhatsApp、Signal — **单一网关进程统一管理**，语音备忘录转写，跨平台对话连续性。

## 核心差异
| 维度 | 特点 |
|------|------|
| 学习能力 | ✅ 自主创建+改进 Skill（独一无二） |
| 消息平台 | 6 个平台统一网关 |
| 模型支持 | 200+ 模型 |
| 终端后端 | 6 种（含无服务器休眠） |
| 定时任务 | 自然语言 Cron |
| 跨会话记忆 | FTS5 + LLM摘要 + Honcho |
