# 跨平台支持对比

> 四个项目支持哪些 AI Coding 工具，以及适配策略。

## 一、OpenSpec：25+ 工具，适配器模式

### 1.1 适配器文件

**出处**：`repos/openspec/src/core/command-generation/adapters/`（25 个适配器文件）

```
claude.ts     cursor.ts    codex.ts      gemini.ts      copilot.ts
windsurf.ts   cline.ts     continue.ts   roocode.ts     kilocode.ts
amazon-q.ts   antigravity.ts  auggie.ts  bob.ts         codebuddy.ts
costrict.ts   crush.ts     iflow.ts     junie.ts       kiro.ts
lingma.ts     opencode.ts  pi.ts        qoder.ts       qwen.ts
factory.ts    ...
```

### 1.2 适配器模式

每个工具通过独立 TypeScript 适配器将内部 Skill 表示转换为目标格式。`openspec init --tool <name>` 自动选择对应适配器。

**出处**：`repos/openspec/src/core/command-generation/registry.ts`

---

## 二、Superpowers：8+ 工具，运行时格式检测

### 2.1 SessionStart 格式分支

**出处**：`repos/superpowers/hooks/session-start` L46-55

```bash
# 根据平台环境变量输出不同格式的 JSON
if [ -n "${CURSOR_PLUGIN_ROOT:-}" ]; then
  # Cursor 格式: additional_context
  printf '{"additional_context": "%s"}' "$session_context"
elif [ -n "${CLAUDE_PLUGIN_ROOT:-}" ] && [ -z "${COPILOT_CLI:-}" ]; then
  # Claude Code 格式: hookSpecificOutput.additionalContext
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}' "$escaped_context"
else
  # Copilot CLI 或其他: SDK 标准格式
  printf '{"additionalContext": "%s"}' "$session_context"
fi
```

注入内容相同，输出格式按平台区分。

### 2.2 工具映射

**出处**：`repos/superpowers/skills/using-superpowers/SKILL.md` L39

> 非 CC 平台：参见 `references/copilot-tools.md`（Copilot CLI）、`references/codex-tools.md`（Codex）获取工具等价映射。

---

## 三、GSD：17 运行时，双布局策略

### 3.1 运行时枚举

**出处**：`repos/gsd/CONTEXT.md` Installer Module

15 个运行时：claude, antigravity, augment, cline, codebuddy, codex, copilot, cursor, gemini, hermes, kilo, opencode, qwen, trae, windsurf

### 3.2 双布局

**出处**：`repos/gsd/CONTEXT.md`

```
非递归 Skill 加载器（7 个运行时）→ 嵌套路由布局：
  6 个 gsd-ns-* 路由 bundle 作为顶层 Skill
  具体 Skill → <router>/skills/<name>/SKILL.md

递归 Skill 加载器（其余运行时）→ 扁平布局：
  skills/gsd-<stem>/
```

### 3.3 权限合并

```javascript
// Claude Code 权限管理
mergeClaudePermissions(settings)  // 非破坏性追加 GSD 的 allow/deny 条目
// 卸载时精确移除这些条目
```

---

## 四、Matt Pocock：Claude Code 原生

主要通过 Claude Code 的 `.claude-plugin/plugin.json` 注册。不主动适配其他平台。

---

## 五、对比总结

| 维度 | OpenSpec | Superpowers | GSD | Matt Pocock |
|------|----------|-------------|-----|-------------|
| **支持数** | **25+** | 8+ | 17 | Claude Code 为主 |
| **策略** | 适配器模式 | 运行时格式检测 | 安装器 + 双布局 | plugin.json |
| **生成方式** | 编译时 | 运行时 | 安装时 | 手写 |
| **权限** | 无 | 无 | 合并 + 卸载清理 | 无 |

### 核心差异

- **OpenSpec**：25+ 适配器 = 最广覆盖。统一适配器模式保证跨工具一致性
- **GSD**：双布局 = 最优平台兼容。非递归加载器（嵌套路由）vs 递归加载器（扁平）分别处理
- **Superpowers**：格式检测 = 实现简单但每个新平台需手动适配
- **Matt Pocock**：Claude Code 原生 = 零适配成本但仅一个平台
