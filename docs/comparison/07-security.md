# 安全防护对比

> 四个项目如何防护 Prompt 注入、Git 危险操作、信息泄露。

## 一、GSD：四层技术安全体系（唯一）

### 1.1 Prompt Guard + Read Scanner

**出处**：`repos/gsd/CONTEXT.md`

```
Prompt Guard           → 写入时扫描注入模式
Read Injection Scanner → 读取时扫描非可信内容
```

写入前检查输出是否含注入模式，读取时检查外部文件内容是否含可能影响 Agent 行为的指令。

### 1.2 Slopcheck：AI 幻觉包检测

Agent 添加依赖前，验证包名在对应注册表（npm / PyPI / crates.io）中真实存在。防止 AI 幻觉出假的依赖包名。

### 1.3 Context Monitor

上下文使用率监视 + 阈值告警。防止溢出导致信息截断。

---

## 二、Matt Pocock：git-guardrails Hook

### 2.1 危险操作拦截

**出处**：`repos/mattpocock/skills/misc/git-guardrails-claude-code/SKILL.md`

PreToolUse Hook 拦截以下 Git 命令：

```json
{
  "PreToolUse": [{
    "matcher": "Bash",
    "hooks": [{
      "type": "prompt",
      "prompt": "检查此 git 命令是否具有破坏性：git push --force、git reset --hard、
        git clean -f、git branch -D。如果是，阻止它。"
    }]
  }]
}
```

被拦截操作：
- `git push --force`
- `git reset --hard`
- `git clean -f`
- `git branch -D`

### 2.2 setup-pre-commit

**出处**：`repos/mattpocock/skills/misc/setup-pre-commit/SKILL.md`

Husky + lint-staged + Prettier + typecheck + test。代码提交前必须通过所有检查。

---

## 三、Superpowers：心理学防护

### 3.1 Cialdini 说服原则

不依赖技术屏障，用心理学设计防止 Agent 绕过规则：

- **互惠**：Agent 跳过流程 = 损害与其合作的用户利益
- **承诺一致性**：Agent 已承诺遵守 using-superpowers 规则，违背则不一致
- **社会认同**："如果 Skill 存在，就用它"——暗示其他 Agent 都这样做

### 3.2 身份语言设计

"your human partner"（你的人类伙伴）替代 "the user"（用户）——刻意用语使 Agent 将用户视为对等合作伙伴而非工具使用者，降低对抗心理。

### 3.3 物理防护：违规即删除代码

未经 TDD 的代码直接删除，不留任何"参考"。

---

## 四、OpenSpec：数据完整性防护

### 4.1 操作前验证

所有写操作：先验证 → 通过后执行 → 执行后再验证。验证失败阻止写入。

### 4.2 安全模型

以**数据完整性**为核心。不针对 Prompt 注入，不检测幻觉包。

---

## 五、对比总结

| 维度 | GSD | Matt Pocock | Superpowers | OpenSpec |
|------|-----|-------------|-------------|----------|
| **Prompt 注入** | **Guard + Scanner** | 无 | 心理学防御 | 无 |
| **幻觉检测** | **Slopcheck** | 无 | 无 | 无 |
| **Git 防护** | 状态机门控 | **guardrails Hook** | 无 | 无 |
| **上下文安全** | **Context Monitor** | 无 | 无 | 无 |
| **行为防护** | 命令过滤 | pre-commit 检查 | 心理学 + HARD-GATE | Schema 验证 |
| **综合强度** | ★★★★★ | ★★★ | ★★★★ | ★★ |

### 核心差异

- **GSD**：唯一有**完整技术安全体系**的项目。注入扫描、幻觉包检测、上下文溢出监控全覆盖
- **Matt Pocock**：聚焦 Git 操作防护。guardrails + pre-commit，务实有效
- **Superpowers**：唯一使用**心理学防护**的项目。信任心理防线 > 技术防线
- **OpenSpec**：安全 = 数据完整性。Schema 验证保证产物不损坏
