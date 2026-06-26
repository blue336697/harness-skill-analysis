## 1. 项目搭建

- [x] 1.1 初始化 package.json（依赖: express, uuid；开发依赖: typescript, tsx, @types/*）
- [x] 1.2 创建 tsconfig.json（strict 模式 + ESM 模块设置）
- [x] 1.3 创建 src/ 目录结构（types, validators, services, routes, middleware, __tests__）

## 2. 类型定义

- [x] 2.1 在 src/types/task.ts 中定义 TaskStatus、TaskPriority、Task 类型
- [x] 2.2 定义 CreateTaskInput、UpdateTaskInput 类型（含严格字段约束）
- [x] 2.3 定义 ApiResponse<T> 和 PaginatedResponse<T> 信封类型
- [x] 2.4 定义 AppError、ValidationError、NotFoundError 类

## 3. 输入校验

- [x] 3.1 在 src/validators/task.ts 中实现 validateCreateTask(input: unknown): CreateTaskInput
- [x] 3.2 实现 validateUpdateTask(input: unknown): UpdateTaskInput（至少一个字段检查）
- [x] 3.3 实现 validateStatusTransition(current: TaskStatus, next: TaskStatus): void（状态机规则）

## 4. 服务层（纯函数）

- [x] 4.1 实现 createTask(store, input): Task — 生成 UUID、设置默认值、添加到 store、返回新任务
- [x] 4.2 实现 listTasks(store, filter?): Task[] — 按状态过滤、应用 offset/limit 分页
- [x] 4.3 实现 getTask(store, id): Task — 按 ID 查找、缺失时抛出 NotFoundError
- [x] 4.4 实现 updateTask(store, id, input): Task — 校验状态转换、不可变更新
- [x] 4.5 实现 deleteTask(store, id): void — 从 store 移除、缺失时抛出 NotFoundError
- [x] 4.6 实现 createTaskStore(): Map<string, Task> — 内存 store 的工厂函数

## 5. 路由处理器

- [x] 5.1 实现 POST /api/v1/tasks 处理器（校验 → 服务 → 响应）
- [x] 5.2 实现 GET /api/v1/tasks 处理器（查询参数解析 + 分页）
- [x] 5.3 实现 GET /api/v1/tasks/:id 处理器
- [x] 5.4 实现 PATCH /api/v1/tasks/:id 处理器
- [x] 5.5 实现 DELETE /api/v1/tasks/:id 处理器

## 6. 中间件

- [x] 6.1 实现全局错误处理中间件（AppError 子类型 → HTTP 状态码映射）

## 7. 应用入口

- [x] 7.1 创建 src/app.ts — 配置 Express（JSON 解析、路由、错误中间件）
- [x] 7.2 创建 src/index.ts — 在可配置端口启动服务器、记录启动消息

## 8. 集成测试

- [x] 8.1 编写测试: 有效输入创建任务 → 201 + Task 对象
- [x] 8.2 编写测试: 空标题创建任务 → 400
- [x] 8.3 编写测试: 列出任务 → 200 + 分页响应
- [x] 8.4 编写测试: 按状态过滤列出任务 → 200 + 过滤结果
- [x] 8.5 编写测试: 按 ID 获取任务 → 200；获取不存在 → 404
- [x] 8.6 编写测试: 更新任务标题 → 200；无效状态转换 → 400
- [x] 8.7 编写测试: 删除任务 → 204；获取已删除 → 404

## 9. 手动验证

- [x] 9.1 启动服务器并运行全部5个端点的 curl 命令
- [x] 9.2 用 curl 验证状态机转换
- [x] 9.3 验证 400 和 404 情况的错误响应信封格式
