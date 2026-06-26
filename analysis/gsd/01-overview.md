# GSD Core 分析报告

> **仓库**: [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core) | 4K+ Stars | MIT License
> **定位**: 元提示 + 上下文工程 + 规约驱动开发框架

## 核心理念

**"Git. Ship. Done."** — 位于用户和 AI 编码代理之间的轻量编排层。

三个层面：
1. **上下文工程** — 通过结构化产物给 AI 所需一切，解决 context rot
2. **多代理编排** — 薄编排器孵化专用子代理，fresh context per task
3. **规约驱动开发** — Discuss→Plan→Execute→Verify→Ship 流水线

## 架构规模
- **69 个命令** (`commands/gsd/`)
- **34 个 Agent 定义** (`agents/`)
- **37 个 Capabilities** (`capabilities/`)
- **~110 个工作流文件** (`gsd-core/workflows/`)
- **17 个运行时支持** (Claude Code, Codex, Gemini CLI, Copilot, Cursor...)

## 五阶段循环
```
Discuss → Plan → Execute → Verify → Ship
```

### 各阶段核心机制
- **Discuss**: 自适应提问 + 代码库探查 → `CONTEXT.md`（8个XML块）
- **Plan**: 4并行研究者 → 综合 → 计划检查(最多3轮) → `PLAN.md`
- **Execute**: 波分析 → 波内并行/波间串行 → fresh 200k context per executor
- **Verify**: 对抗性验证(从"目标未达成"假设开始) → `VERIFIED/FAILED/UNCERTAIN`
- **Ship**: PR+归档+状态更新

## Token 优化（关键创新）

| 机制 | 效果 |
|------|------|
| 两级命名空间路由 | ~67技能→6个路由器，增量 ~2,150→~120 tokens |
| Fresh-context subagents | 不携带累积会话历史 |
| Context-budget 规则 | 按窗口大小自适应读取深度 |
| effort 声明 | heavy编排器 xhigh，轻量命令 low |
| 状态外化 | 所有状态在文件系统，不依赖会话记忆 |

## 状态管理
- `STATE.md`: YAML前置(gsd_state_version, milestone, status, active_phase, next_action)
- 状态机: discussing→planning→executing→verifying→completed
- 原子锁: O_EXCL创建，10秒过期自动清理

## 安全防护
1. **Prompt Guard**: 写入时扫描注入模式
2. **Read Injection Scanner**: 读取时扫描非可信内容
3. **Slopcheck**: 检测AI幻觉包名预注册
4. **Context Monitor**: 上下文使用率监视+告警

## Crash Recovery
- `/gsd-pause-work` + `/gsd-resume-work` 完整检查点
- 原子Git提交，部分完成不丢失
- 安装器补丁备份

## 架构亮点
1. **两级命名空间路由** — 极致Token优化
2. **Capability描述符系统** — 37个能力JSON，声明式运行时适配
3. **波分析并行执行** — 依赖DAG→波分组→波内并行
4. **对抗性验证** — 不信任声明，每个truth必须解析为VERIFIED/FAILED/UNCERTAIN
