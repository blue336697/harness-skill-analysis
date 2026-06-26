# Trae Agent 架构分析
> [github.com/bytedance/trae-agent](https://github.com/bytedance/trae-agent) | ~12K Stars | TypeScript | MIT

## 定位
字节跳动出品，"用于通用软件工程任务的 LLM Agent。" **研究导向**，非生产级产品。README 自述："透明、模块化架构，研究人员可轻松修改、扩展和分析。"

## 架构
**单一 YAML 配置驱动**。配置优先级: CLI参数 > 配置文件 > 环境变量 > 默认值

```
agent_config:
  model: claude-sonnet-4-6
  max_steps: 200       ← Agent 步骤上限
  max_tokens: 4096     ← 单次响应上限
  tools: [bash, str_replace_based_edit_tool, sequentialthinking, task_done]
```

## Agent 循环
**基于步骤的循环**: 每步调用工具(bash/文件编辑/推理) → 继续直到任务完成或达到 max_steps。
**轨迹记录**: JSON 文件记录所有 Agent 动作（LLM交互/步骤/工具使用/元数据）。
**Lakeview**: 步骤摘要（短而精炼）。

## 工具系统
默认工具集:
- `bash` — Shell 命令执行
- `str_replace_based_edit_tool` — 字符串替换文件编辑
- `sequentialthinking` — 结构化推理
- `task_done` — 任务完成信号
- **MCP 支持** — 可接入 Playwright 等 MCP 服务

## CLI
`run`, `show-config`, `interactive`（支持 `status/help/clear/exit/quit`）

## Docker 集成
支持容器内运行: 镜像/容器ID/Dockerfile/tar 归档 + 自动清理

## 上下文管理
- `max_steps` — 步骤上限（防止无限循环）
- `max_tokens` — 响应长度控制
- 轨迹记录 — 离线分析用
- **无滑动窗口、无自动摘要、无内存修剪**

## 核心差异
| 维度 | 特点 |
|------|------|
| 定位 | 研究平台（非生产工具） |
| 配置 | 单一 YAML 文件 |
| 论文 | arXiv 2507.23370 |
| MCP | 支持 |
| Docker | 内置容器执行 |
| 轨迹 | 完整 JSON 轨迹记录 |
