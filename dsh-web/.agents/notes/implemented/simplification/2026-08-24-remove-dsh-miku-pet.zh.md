# Agent Note: 移除 dsh-miku-pet

Status: implemented

## 问题

 dsh-miku-pet 曾作为独立插件发布，并被纳入 dsh-web-all 聚合包、社区插件索引和 Workshop 清单。移除插件后继续保留这些入口，会留下指向不存在包的可安装元数据和聚合引用。

## 决策

移除 dsh-miku-pet 包及其素材，同时清理社区索引条目、dsh-web-all 聚合清单和生成的 patch/依赖输出，并重新生成工作区锁文件与 Workshop 插件清单。内置 dsh-pet 保持可用。

## 考虑过的替代方案

- 只禁用运行时 profile 条目：否决，因为插件仍会通过社区索引和 Workshop 保持可安装、可发现。
- 保留源码但从聚合包移除：否决，因为孤立的插件代码和元数据仍会保留不受支持的插件入口。

## 影响

 dsh-miku-pet 的浮层、路由、设置区、素材和安装元数据不再提供。已经单独安装该插件的用户需要从 DSH profile 中移除对应 bundle；本仓库不再提供或聚合它。

## 测试

已重新生成聚合器、工作区锁文件、社区索引和 Workshop 清单，并检查剩余的活动或生成产物中的 dsh-miku-pet 引用。
