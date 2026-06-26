# Issue: 创建任务（示踪子弹）

**父Issue**: PRD #1 - Task CRUD REST API
**类型**: AFK
**被阻塞于**: 无 - 可立即开始
**用户故事**: #1

## 构建内容

Establish the full infrastructure (types, Express app, error middleware, store factory) and implement the POST /api/v1/tasks endpoint. This is the tracer bullet — it cuts through every layer end-to-end.

The endpoint accepts `{ title, description?, priority? }`, validates the title is 1-200 chars, generates a UUID v4 id, sets defaults (status=`todo`, priority=`medium`, description=`""`), and returns the created Task in the Envelope format.

## 验收标准

- [ ] POST /api/v1/tasks with `{"title": "Buy groceries"}` returns 201 with full Task object (id, title, status=todo, timestamps)
- [ ] POST /api/v1/tasks with `{"title": ""}` returns 400 with error message
- [ ] POST /api/v1/tasks with `{"title": "X", "priority": "high"}` returns Task with priority=high
- [ ] Missing title returns 400
- [ ] All responses use the Envelope format `{ success, data, error }`
- [ ] Server starts on configurable PORT and responds to requests
