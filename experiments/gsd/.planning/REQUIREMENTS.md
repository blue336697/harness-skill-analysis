# 需求 — TaskFlow API MVP

## FR-1: 创建任务
- POST /api/v1/tasks
- 输入: title（1-200字符，必填），description（字符串，可选），priority（low/medium/high，可选，默认 medium）
- 输出: 201 + Task 对象（含生成的 UUID v4、status=todo、ISO 8601 时间戳）
- 错误: 400（空/缺失标题、无效优先级）

## FR-2: 列出任务
- GET /api/v1/tasks
- 查询参数: status（可选过滤），offset（默认 0），limit（默认 20，最大 100）
- 输出: 200 + 分页响应（含 tasks 数组和 meta.total/offset/limit）

## FR-3: 获取任务
- GET /api/v1/tasks/:id
- 输出: 200 + Task 对象
- 错误: 404（id 未找到）

## FR-4: 更新任务
- PATCH /api/v1/tasks/:id
- 输入: 部分 Task 字段（至少一个必填）
- 状态转换强制: todo↔in_progress→done, done→todo。禁止: todo→done, done→in_progress
- 不可变更新: 返回新 Task 对象，原对象不变
- 错误: 400（无字段、无效转换）；404（id 未找到）

## FR-5: 删除任务
- DELETE /api/v1/tasks/:id
- 输出: 204 No Content
- 错误: 404（id 未找到）

## FR-6: ApiResponse 信封
- 所有响应: { success: boolean, data: T | null, error: string | null }
- 分页: 增加 meta: { total: number, offset: number, limit: number }
