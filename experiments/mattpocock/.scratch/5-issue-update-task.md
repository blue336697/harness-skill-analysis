# Issue: 更新任务（含状态转换）

**父Issue**: PRD #1 - Task CRUD REST API
**类型**: AFK
**被阻塞于**: #2 (Create Task tracer bullet)
**用户故事**: #6, #7, #8

## 构建内容

Add PATCH /api/v1/tasks/:id endpoint. Accepts partial updates to title, description, priority, and/or status. At least one field required. Validates Status Transitions per the state machine — forbidden Transitions return 400.

The ALLOWED_TRANSITIONS map is: todo→in_progress, in_progress→todo, in_progress→done, done→todo. Direct todo→done and done→in_progress are forbidden.

## 验收标准

- [ ] PATCH with `{"title": "New title"}` returns 200 with updated Task, updatedAt changed
- [ ] PATCH with `{}` returns 400 "At least one field must be provided"
- [ ] PATCH with `{"status": "done"}` on a todo Task returns 400 with transition error
- [ ] PATCH with `{"status": "in_progress"}` on a todo Task succeeds
- [ ] Update uses immutable patterns — original Task is not mutated
