## 新增需求

### 需求: 创建任务
系统必须（SHALL）允许创建新任务，包含标题、可选描述和可选优先级。标题必须为 1-200 个字符。系统必须分配 UUID v4 ID，如未指定则设置初始状态为 `todo`、优先级为 `medium`。

#### 场景: 有效输入创建任务
- **当（WHEN）** 客户端发送 POST /api/v1/tasks 携带 `{"title": "Buy groceries", "priority": "high"}`
- **则（THEN）** 系统返回 201 及 Task 对象，包含生成的 id、标题 "Buy groceries"、优先级 "high"、状态 "todo"、ISO 8601 时间戳

#### 场景: 空标题创建任务
- **当（WHEN）** 客户端发送 POST /api/v1/tasks 携带 `{"title": ""}`
- **则（THEN）** 系统返回 400 及错误消息 "标题必须为1-200个字符"

#### 场景: 仅标题创建任务
- **当（WHEN）** 客户端发送 POST /api/v1/tasks 携带 `{"title": "Review PR"}`
- **则（THEN）** 系统返回 201，描述默认为 ""，优先级默认为 "medium"

### 需求: 列出任务并支持状态过滤
系统必须返回分页的任务列表，支持按状态过滤、offset 和 limit 查询参数（默认值分别为 0 和 20，最大 limit 为 100）。

#### 场景: 列出所有任务
- **当（WHEN）** 客户端发送 GET /api/v1/tasks
- **则（THEN）** 系统返回 200 及分页响应，包含所有任务和 meta（total, offset, limit）

#### 场景: 按状态过滤任务
- **当（WHEN）** 客户端发送 GET /api/v1/tasks?status=todo
- **则（THEN）** 系统返回 200，仅包含状态为 "todo" 的任务

### 需求: 按 ID 获取任务
系统必须按 UUID 返回单个任务。如任务不存在则必须返回 404。

#### 场景: 获取存在的任务
- **当（WHEN）** 客户端发送 GET /api/v1/tasks/:id 使用有效存在的任务 ID
- **则（THEN）** 系统返回 200 及 Task 对象

#### 场景: 获取不存在的任务
- **当（WHEN）** 客户端发送 GET /api/v1/tasks/:id 使用不存在的 UUID
- **则（THEN）** 系统返回 404 及错误消息 "任务未找到"

### 需求: 更新任务
系统必须允许更新任务的标题、描述、优先级和/或状态。至少需要提供一个字段。状态转换必须遵循状态机规则。禁止直接 todo → done 和 done → in_progress 转换。

#### 场景: 更新任务标题
- **当（WHEN）** 客户端发送 PATCH /api/v1/tasks/:id 携带 `{"title": "新标题"}`
- **则（THEN）** 系统返回 200 及更新后的 Task 对象，updatedAt 已变更

#### 场景: 无效状态转换
- **当（WHEN）** 客户端发送 PATCH /api/v1/tasks/:id 携带 `{"status": "done"}` 操作一个当前状态为 "todo" 的任务
- **则（THEN）** 系统返回 400 及描述无效转换的错误消息

#### 场景: 无字段更新
- **当（WHEN）** 客户端发送 PATCH /api/v1/tasks/:id 携带 `{}`
- **则（THEN）** 系统返回 400 及错误 "至少需要提供一个字段"

### 需求: 删除任务
系统必须允许按 UUID 删除任务。成功时返回 204 No Content，任务不存在时返回 404。

#### 场景: 删除存在的任务
- **当（WHEN）** 客户端发送 DELETE /api/v1/tasks/:id 使用有效存在的任务 ID
- **则（THEN）** 系统返回 204，无响应体，后续 GET 返回 404

#### 场景: 删除不存在的任务
- **当（WHEN）** 客户端发送 DELETE /api/v1/tasks/:id 使用不存在的 UUID
- **则（THEN）** 系统返回 404 及错误消息 "任务未找到"
