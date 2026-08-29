# Agent Note: Issue default assignee uses an Issue-only fallback

Status: implemented

## Problem

在作出本决定时，Issue 创建工作流与 PR 路由共用 `defaultRoute`。该路由会把没有匹配分类的 PR 分配给仓库所有者，而新 Issue 需要把默认兜底负责人设为协作者。直接复用或修改共享路由会改变 PR 的分配行为。

## Decision

此前的实现定义了 `issueDefaultRoute.assignees`，值为 `["Aa728848"]`。`.github/workflows/auto-assign-issues.yml` 先执行 Issue 分类匹配；没有匹配到 Issue 分类路由时使用 `issueDefaultRoute`，如果配置无法读取则使用硬编码的 Aa728848 兜底。共享的 `defaultRoute` 保持不变，继续供 PR 路由使用。现有 Issue 模板不做修改。

因此，能够识别分类的 Issue 使用对应的分类负责人，未匹配分类的 Issue 分配给 Aa728848。工作流只响应新建 Issue，排除 pull request 载荷，并从负责人列表中排除 Issue 作者。

## Alternatives considered

- 将 `defaultRoute.assignees` 改为 `Aa728848`：否决，因为 PR 自动分配工作流也读取该字段，会把没有匹配路由的 PR 从仓库所有者转给 Aa728848。
- 在每个 Issue 模板中加入 `assignees`：否决，因为模板级分配不是兜底语义，还会绕过现有分类路由；用户当时也已经修改了模板。
- 忽略分类路由，把所有 Issue 都分配给 Aa728848：本决定否决，因为这会替换现有路由策略，而不是只修改默认兜底。

## Consequences

此前的实现会把未匹配分类的新 Issue 分配给 Aa728848；配置读取失败时也会使用 Aa728848 作为硬编码兜底。PR 的审查者与负责人路由继续由共享的 `defaultRoute` 控制。如果唯一配置的负责人就是 Issue 作者，作者过滤会让该 Issue 保持未分配状态。

保持 `defaultRoute` 独立于 Issue 分配的理由仍属于当前 PR 路由策略。

## Supersession

[分离 Issue 与 PR 分配](2026-08-25-issue-pr-assignment-separation.zh.md)取代了本记录中的 Issue 分配行为。当前 Issue 路由不按分类匹配或过滤作者，而是把每个新建 Issue 分配给 `Aa728848`；stale-assignment 工作流只处理 PR。当前配置不再包含 `issueDefaultRoute` 或 Issue 专用的 `issueTypes` 元数据；`defaultRoute` 与路由级负责人仍只服务于 PR。
