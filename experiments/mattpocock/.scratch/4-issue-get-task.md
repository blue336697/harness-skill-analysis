# Issue: 获取任务（按ID）

**父Issue**: PRD #1 - Task CRUD REST API
**类型**: AFK
**被阻塞于**: #2 (Create Task tracer bullet)
**用户故事**: #5

## 构建内容

Add GET /api/v1/tasks/:id endpoint. Returns a single Task by its UUID id. Returns 404 with Envelope error if id doesn't exist.

## 验收标准

- [ ] GET /api/v1/tasks/:id with valid id returns 200 + Task in Envelope
- [ ] GET /api/v1/tasks/:id with non-existent UUID returns 404 with error "Task not found"
