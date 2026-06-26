# Claude Code 内置 Slash 命令全集

> 版本: v2.1.177 (2026-06) | 总计: 70+ 命令（含别名和 Bundled Skills）
> 来源: CC 官方文档 + claude-howto + dev.to + 阿里云开发者 + Qiniu News + 实测

---

## 一、会话管理类 (Session Management)

| 命令 | 别名 | 作用 |
|------|------|------|
| `/clear` | `/reset`, `/new` | 清空对话历史，释放上下文窗口 |
| `/compact [指令]` | — | 压缩上下文，保留关键信息。可加焦点指令 |
| `/rewind` | `/checkpoint`, `/undo` | 回滚对话和代码到检查点 |
| `/resume [会话名]` | `/continue` | 恢复之前的会话 |
| `/branch [名称]` | `/fork`(已弃用) | 从当前节点创建对话分支 |
| `/export [文件名]` | — | 导出当前对话到文件或剪贴板 |
| `/rename [名称]` | — | 重命名当前会话 |
| `/btw <问题>` | — | 旁路问题，不写入主历史（不污染上下文） |
| `/side` | — | 打开临时旁路对话 |
| `/teleport` | — | 将 claude.ai Web 会话拉到终端 |
| `/goal <描述>` | — | 设置会话完成条件，CC持续工作直到满足 |
| `/recap` | — | 手动触发会话上下文回顾 |
| `/tui` | — | 切换全屏 TUI 模式 |
| `/focus` | — | 切换专注视图，减少界面噪音 |
| `/desktop` | `/app` | 在 Desktop 应用中继续会话 |
| `/mobile` | `/ios`, `/android` | 生成移动端二维码 |

---

## 二、上下文与资源管理类 (Context & Resource)

| 命令 | 作用 |
|------|------|
| `/context` | 彩色网格可视化上下文使用量，含内存膨胀警告 |
| `/cost` | 当前会话 token 使用和费用统计 |
| `/usage` | 规范用量面板：计划限制、速率限制、费用；按技能/子代理/插件分类 |
| `/stats` | 可视化每日用量、会话历史、连续使用天数 |
| `/model [模型名]` | 交互式切换模型（方向键选择），保存为新会话默认值 |
| `/effort [low\|medium\|high\|xhigh\|max\|auto]` | 设置推理深度；`max` 需 Opus 4.6+ |
| `/fast [on\|off]` | 切换快速模式 |
| `/scroll-speed <+N\|-N>` | 调整 TUI 鼠标滚轮速度 |
| `/usage-credits` | 配置额外用量额度 |
| `/memory` | 编辑 CLAUDE.md 记忆文件，切换自动记忆 |
| `/add-dir <路径>` | 添加额外工作目录（monorepo 必备） |

---

## 三、代码分析与质量类 (Code Analysis & Quality)

| 命令 | 作用 | 中间文件？ |
|------|------|:---:|
| `/diff` | 交互式 diff 查看器（jk/方向键/PgUp/PgDn 滚动） | ❌ |
| `/code-review [effort]` | **Bundled Skill** — 7个独立角度发现bug → 1票验证 → JSON输出 | ❌ |
| `/security-review` | 扫描当前 diff 的安全漏洞（注入/认证/数据暴露/CSRF等10类） | ❌ |
| `/simplify [focus]` | **Bundled Skill** — 4个并行Agent清理（复用/简化/效率/抽象），自动修复 | ❌(直接改代码) |
| `/batch <指令>` | **Bundled Skill** — 5-30个隔离Agent通过git worktree并行变更 | ✅ worktree+PR |
| `/autofix-pr [提示]` | 云端Agent监控PR，CI失败或review时自动推送修复 | ❌ |
| `/ultrareview` | 云端多Agent代码审查（高风险PR） | ❌ |
| `/ultraplan <提示>` | 云端深度规划，可在浏览器审查 | ❌ |
| `/plan [描述]` | 规划模式 — 输出计划但不改文件，需确认后执行 | ❌ |

### `/code-review` 7角度机制
```
Phase 0: 收集 diff
Phase 1: 7个发现角度(每角度≤6候选)
  A: 逐行扫描(条件反转/off-by-one/null/缺少await/0假值/复制粘贴错误)
  B: 删除行为审计(被删守卫/错误路径是否在新代码中重建?)
  C: 跨文件追踪(改了函数签名→所有调用点安全?)
  D: 复用(新增代码是否重写了已有工具?)
  E: 简化(冗余状态/深嵌套/死代码)
  F: 效率(重复计算/串行可并行/闭包内存泄漏)
  G: 抽象层次(修补是否在正确的深度?)
Phase 2: 去重→每候选1票验证→CONFIRMED/PLAUSIBLE/REFUTED
输出: ≤8个发现 JSON [{file, line, summary, failure_scenario}]
```

---

## 四、配置与环境管理类 (Configuration & Environment)

| 命令 | 作用 |
|------|------|
| `/config` (`/settings`) | 打开交互式设置 UI（主题、模型、输出风格） |
| `/init` | 为当前项目初始化 `CLAUDE.md` |
| `/permissions` (`/allowed-tools`) | 管理工具权限规则（allow/ask/deny） |
| `/less-permission-prompts` | 分析工具调用，自动添加允许列表到 settings.json |
| `/hooks` | 查看/管理 Hook 配置（PreToolUse/PostToolUse/Stop等） |
| `/mcp` | 管理 MCP 服务器连接和 OAuth |
| `/plugin` | 从市场安装/管理插件 |
| `/reload-plugins` | 不重启重载插件 |
| `/reload-skills` | 不重启重新扫描技能目录 |
| `/skills` | 列出/搜索可用技能，支持关键词过滤 |
| `/ide` | 管理 IDE 集成（VS Code, Cursor, Windsurf等） |
| `/terminal-setup` | 配置终端按键绑定 |
| `/chrome` | 配置 Chrome 浏览器集成 |
| `/keybindings` | 打开按键绑定配置 |
| `/theme` | 主题选择器，管理 `~/.claude/themes/` 自定义主题 |
| `/color [color\|default]` | 设置提示栏颜色；裸 `/color` 随机选择 |
| `/statusline` | 配置状态行显示 |
| `/sandbox` | 切换沙箱隔离模式 |
| `/voice` | 切换语音输入 |
| `/remote-env` | 配置默认远程环境 |
| `/web-setup` | 连接 GitHub 到 CC Web 版 |

---

## 五、诊断、调试与协作类 (Diagnostics & Debugging)

| 命令 | 作用 |
|------|------|
| `/doctor` | 诊断安装健康；按 `f` 自动修复 |
| `/status` | 显示完整状态：版本/模型/账户/环境 |
| `/debug [描述]` | **Bundled Skill** — 启用并分析会话调试日志 |
| `/insights` | 生成项目使用分析报告(交互模式/摩擦点/模型偏好) |
| `/feedback` (`/bug`) | 提交反馈或bug报告 |
| `/release-notes` | 查看更新日志（交互式版本选择器） |
| `/schedule [描述]` | 云端定时任务（对话式设置） |
| `/remote-control` (`/rc`) | 从 claude.ai 远程控制当前会话 |
| `/loop [间隔] <提示>` | **Bundled Skill** — 按固定间隔反复运行 |
| `/powerup` | 交互式功能教程（动画演示） |
| `/team-onboarding` | 自动生成队友 ramp-up 指南 |
| `/heapdump` | 写入堆快照，诊断内存问题 |
| `/workflows` | 查看动态工作流运行记录 |
| `/tasks` | 列出/管理后台 Bash/Agent 任务 |

---

## 六、账户、登录与工具类 (Account & Utility)

| 命令 | 别名 | 作用 |
|------|------|------|
| `/login` | — | 切换/认证 Anthropic 账户（OAuth） |
| `/logout` | — | 登出 |
| `/exit` | `/quit` | 退出 REPL |
| `/help` | — | 显示完整帮助参考 |
| `/claude-api` | — | **Bundled Skill** — 加载 Claude API 参考 |
| `/copy [N]` | — | 复制回复到剪贴板；`w` 写入文件 |
| `/install-github-app` | — | 设置 GitHub Actions 应用 |
| `/install-slack-app` | — | 安装 Slack 应用 |
| `/stickers` | — | 订购 CC 贴纸（彩蛋） |
| `/passes` | — | 分享一周免费 CC |
| `/privacy-settings` | — | 隐私设置（Pro/Max） |
| `/upgrade` | — | 打开升级页面 |

---

## 七、已弃用/移除

| 命令 | 状态 |
|------|------|
| `/review` | 弃用 → 用 `/code-review` |
| `/output-style` | v2.1.73 弃用 |
| `/fork` | v2.1.77 重命名为 `/branch` |
| `/pr-comments` | v2.1.91 移除 |
| `/vim` | v2.1.92 移除 → `/config` 编辑器模式 |

---

## 八、Bundled Skills（随主程序附带的技能）

| 技能 | 作用 |
|------|------|
| `/batch` | git worktree 大规模并行变更 |
| `/claude-api` | 加载 Claude API 参考 |
| `/debug` | 启用调试日志 |
| `/loop` | 定时循环执行 |
| `/code-review` | 多角度bug审查 |
| `/simplify` | 清理型审查，自动修复 |

---

## 九、命令类型说明

| 类型 | 示例 | 来源 |
|------|------|------|
| **Built-in** | `/init`, `/clear`, `/doctor` | 编译在二进制中 |
| **Bundled Skill** | `/code-review`, `/simplify` | 随主程序附带的 Skill |
| **Custom** | `/deploy`, `/standup` | `.claude/commands/*.md` 自定义 |
| **Plugin** | `/gsd:plan-phase` | 第三方插件注册 |
| **MCP** | `/mcp__github__list_prs` | MCP 服务器暴露 |
