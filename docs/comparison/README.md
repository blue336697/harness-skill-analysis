# 四项目深度对比

> OpenSpec · Superpowers · GSD · Matt Pocock Skills
> 每个维度独立成文，所有结论引用原始出处。

## 索引

| 编号 | 维度 | 文件 | 核心问题 |
|------|------|------|---------|
| 01 | 工作流模型 | [01-workflow-model.md](01-workflow-model.md) | 如何定义"从需求到完成"？ |
| 02 | Skill/命令设计 | [02-skill-design.md](02-skill-design.md) | 如何设计、组织、触发 Skill？ |
| 03 | 上下文工程 | [03-context-engineering.md](03-context-engineering.md) | 如何管理 Token 和防止 Context Rot？ |
| 04 | 质量保障 | [04-quality-assurance.md](04-quality-assurance.md) | 如何验证质量和防止 Bug？ |
| 05 | 多代理编排 | [05-agent-orchestration.md](05-agent-orchestration.md) | 如何管理 sub-agent？ |
| 06 | 跨平台支持 | [06-cross-platform.md](06-cross-platform.md) | 支持哪些运行时？ |
| 07 | 安全防护 | [07-security.md](07-security.md) | 如何防护注入和危险操作？ |

## 四项目速览

| | OpenSpec | Superpowers | GSD | Matt Pocock |
|---|----------|-------------|-----|-------------|
| **GitHub** | Fission-AI/OpenSpec | obra/superpowers | open-gsd/gsd-core | mattpocock/skills |
| **Stars** | 53K+ | 228K+ | 4K+ | 129K+ |
| **定位** | SDD 规约驱动 | 完整软件方法论 | 上下文工程框架 | 实战技能集 |
| **哲学** | 先对齐再构建 | 流程强制+心理学 | 编排+极致Token优化 | 小、独立、可组合 |
| **复杂度** | ★★★☆ | ★★★★ | ★★★★★ | ★★☆☆ |
| **适用阶段** | 全过程（brownfield优先） | **初始化** | 长周期 | **敏捷迭代** |

## 出处规范

所有结论通过以下格式引用原始出处：

```markdown
**出处**：`repos/<project>/<file-path>` L<line-numbers>

<实际代码或配置片段>
```

## 源码位置

```
repos/
├── openspec/      ← Fission-AI/OpenSpec
├── superpowers/   ← obra/superpowers
├── gsd/           ← open-gsd/gsd-core
└── mattpocock/    ← mattpocock/skills
```
