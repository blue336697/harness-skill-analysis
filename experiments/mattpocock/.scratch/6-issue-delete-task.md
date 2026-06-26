# Issue: 删除任务

**父Issue**: PRD #1 - Task CRUD REST API
**类型**: AFK
**被阻塞于**: #2 (Create Task tracer bullet)
**用户故事**: #9

## 构建内容

Add DELETE /api/v1/tasks/:id endpoint. Removes the Task from the Store. Returns 204 No Content on success. Returns 404 if Task doesn't exist. Subsequent GET on deleted id returns 404.

## 验收标准

- [ ] DELETE /api/v1/tasks/:id with valid id returns 204, no body
- [ ] DELETE /api/v1/tasks/:id with non-existent id returns 404
- [ ] GET /api/v1/tasks/:id after DELETE returns 404
