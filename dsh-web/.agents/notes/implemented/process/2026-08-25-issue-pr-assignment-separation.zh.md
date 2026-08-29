# Agent Note: Separate Issue assignment from PR ownership

Status: implemented

## Problem

Issue 创建工作流从与 PR 共用的分类路由中读取负责人。大多数分类路由把 PR 工作分给仓库所有者，因此匹配到这些分类的 Issue 会分给 `zhu1090093659`；通用的 stale-assignment 扫描还可能把不活跃的 Issue 工作转给所有者。预期的所有权边界是：所有 Issue 分给协作者 `Aa728848`，仓库所有者只处理 PR。

## Decision

`.github/workflows/auto-assign-issues.yml` 现在把 Issue 分配作为独立策略处理。在 `issues: [opened]` 事件中，它排除 pull request 载荷，并把 Issue 的负责人列表替换为 `["Aa728848"]`，不读取 PR 分类，也不排除 Issue 作者。该工作流没有所有者兜底。

`.github/workflows/stale-assignment.yml` 现在会在检查活动或修改负责人之前跳过所有没有 `pull_request` 载荷的项目。它仍可在协作者负责的 PR 超过 14 天没有活动后把 PR 转给仓库所有者，但不会把 Issue 转给所有者。

`.github/pr-review-routes.json` 现在只服务于 PR：其中的 `defaultRoute` 与路由级 `assignees` 继续把允许的 PR 工作分给 `zhu1090093659`，渲染器 / WebGL PR 仍然只接受 Issue。由于 Issue 工作流不再按分类分配，Issue 专用的 `issueDefaultRoute` 与 `issueTypes` 元数据已移除。本决定取代[此前的 Issue 专用兜底决定](2026-08-24-issue-default-assignee.zh.md)；保持 `defaultRoute` 独立于 Issue 分配的理由仍属于 PR 策略。现有 Issue 模板保持不变。

作为本次改动的一部分，已把当前分配给 `zhu1090093659` 的开放 Issue 显式重新分配给 `Aa728848`；该操作排除了 pull request。

## Alternatives considered

- 保留分类匹配并使用 Issue 专用兜底：否决，因为路由级 `assignees` 是 PR 数据，已经把大多数 Issue 分类分给所有者；默认分支上的配置副本也可能落后于集成分支。
- 把所有共享路由负责人改为 `Aa728848`：否决，因为 `.github/workflows/auto-assign-pr-reviewers.yml` 会读取这些字段，从而把 PR 负责人从仓库所有者改走。
- 保留通用 stale-assignment 扫描：否决，因为它的所有者升级逻辑会在 Issue 不活跃 14 天后再次破坏 Issue 协作者分配规则。
- 只修复后续新 Issue：否决，因为用户要求现有已经分给所有者的开放 Issue 也执行修复。
- 保留排除 Issue 作者的过滤：否决，因为明确的不变量是每个 Issue 都分给协作者，包括由该协作者创建的 Issue。
- 在每个 Issue 模板中加入 `assignees`：否决，因为事件工作流是 API 创建和模板创建 Issue 的统一策略，模板级分配会重复或绕过该策略；现有 Issue 模板保持不变。

## Consequences

新建 Issue 与修复后的开放 Issue 都只有一个负责人 `Aa728848`；如果 GitHub 无法分配该协作者，分配工作流会失败，而不会静默回退到所有者。现有 Issue 模板保持不变。PR 路由仍由 `defaultRoute` 与路由级 PR 字段控制。不再存在按分类分配 Issue 的路径，也不再自动升级不活跃的 Issue。

## Testing

工作流脚本与 JSON 配置会作为仓库聚焦检查的一部分验证。GitHub API 的待处理 Issue 查询确认开放 Issue 的重新分配排除了 pull request，并保持 PR 负责人不变。
