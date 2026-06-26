# Issue: 列出任务（含过滤）

**父Issue**: PRD #1 - Task CRUD REST API
**类型**: AFK
**被阻塞于**: #2 (Create Task tracer bullet)
**用户故事**: #2, #3, #4

## 构建内容

Add GET /api/v1/tasks endpoint. Returns a paginated list of Tasks. Supports optional `status` query parameter for filtering and `offset`/`limit` for pagination (default limit=20, max=100).

## 验收标准

- [ ] GET /api/v1/tasks returns all tasks in Envelope with meta.total, meta.offset, meta.limit
- [ ] GET /api/v1/tasks?status=todo returns only tasks with status=todo
- [ ] GET /api/v1/tasks?offset=0&limit=5 returns at most 5 tasks
- [ ] Limit above 100 is capped at 100
