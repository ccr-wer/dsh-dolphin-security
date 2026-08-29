# Agent Note: 被标记待拆分的内聚大单元（暂缓）

Status: proposed — 等待用户批准专项重构；本次不改代码

## Problem

重复/可维护性审计把五个超大单元标记为 god-function/god-unit 风险：`packages/skins/skin-center/src/pkg-extract.ts`（2743 行；完整的 PKG/TEX/LZ4/PNG 编解码栈加场景提取）、`packages/skins/skin-center/src/we-routes.ts`（963 行；Wallpaper Engine 路由树）、`packages/skins/skin-center/src/client/SkinCenter.tsx`（707 行）、`packages/dsh-plugin-manager/src/host/gateway.ts`（885 行；CliGateway）、`packages/dsh-pet/src/service.ts`（843 行；PetService）。

## Proposal

沿各自的内部接缝拆分，每个都是独立评审的单独改动：pkg-extract 拆为编解码（png/lz4/tex/pkg）与场景提取模块；we-routes 拆为按表面的路由表；SkinCenter 拆为面板组件；CliGateway 按域分组拆路由处理器；PetService 拆状态存储与渲染循环。每次拆分自带 Agent Note 并通过所属包的完整门禁。

## Alternatives considered

在本次代码优化运行内直接实施拆分的方案被否决：体积本身不是缺陷证据——这些单元是内聚的（pkg-extract 是编解码库；路由文件本质是路由表），没有关联的正确性、性能或重复代码发现。没有驱动性缺陷的大型结构重写违反最小改动规则，并把回归风险一次性集中到五个包。

## Consequences

本次运行不改代码。上述清单是未来结构拆分专项的既定 backlog；每一项实施前需各自的提案评审。

## Evidence

行数在 dev 5a4278fbc 处以 wc -l 实测；审计原始数字（719/687/610/653/595）是函数/类区间口径，已被此处的文件级实测取代。
