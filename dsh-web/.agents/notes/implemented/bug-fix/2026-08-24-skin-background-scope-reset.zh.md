# Agent Note: 皮肤背景设置同步防重置

Status: implemented

## 问题

Issue #1107 反馈移动鲸鱼宠物或切换模型后，Skin Center 的背景遮挡会重置为 0%。旧的 `skin-background` 设置作用域会在任意设置文档变化后发布包含 schema 默认值的完整解析段，而 Skin Center v2 active-state 文档才是背景配置的权威存储。把解析段当作完整替换值会让 `backgroundOpacity: 0` 覆盖已持久化的 100 等用户值。

## 决策

保留旧作用域作为回环设置页输入，但将其处理改为带 revision 栅栏的原始用户字段补丁。没有命名空间 revision 或重复 revision 的发布直接忽略。同步逻辑读取 `snapshot.user`，只筛选并规范化用户明确存储的已知字段，将补丁合并到 v2 当前背景值，不再用 schema 默认值替换缺失字段。用户明确存储的默认值仍视为有意选择。

## 影响

无关的宠物或模型设置提交不会再改变背景或写回填充默认值的背景文档。官方设置页明确保存的背景字段仍可生效，旧用户层中不存在的字段继续由 v2 状态控制。纯同步函数补充了 revision 栅栏、非 opacity 字段自定义、显式默认值和异常输入的回归测试。

## 验证

- `pnpm --filter @linxin666/dsh-client-ui-skin-center typecheck`
- `pnpm --filter @linxin666/dsh-client-ui-skin-center test -- --run tests/background-scope.spec.ts`（31 个测试文件、547 个测试通过）
- Skin Center 包已通过工作区 prepare 阶段构建。
- 用户重启 DSH 服务后，真实 GUI 已加载重建后的 bundle；将背景遮挡设为 100%，拖动实际渲染的鲸鱼宠物后，控件值、`--dsw-skin-scrim` 与 `/api/skin-center/v2/active` 均保持 100%。
