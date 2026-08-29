# Agent Note: 宠物玩法入口并入悬浮面板

Status: implemented

## Problem

对声明了 `gameplay` 块的宠物（miku 是参考实现），玩法卡片入口此前是一枚悬浮药丸，锚在精灵左下角下方（`pet.module.css` 的 `.gameplayToggle`）。悬浮面板（喂食/改名/隐藏 + 亲密度两行）同样从精灵正下方打开并水平居中；面板宽度不亚于精灵盒（min-width 148px 对比默认 160px 的精灵盒，且不换行的亲密度行还会撑得更宽），于是面板左缘伸进药丸的落点，又因为它是靠后的 DOM 兄弟节点而同时拦截点击。只有把宠物拖高到下方空间足够容纳面板时才会出现重叠（默认停靠底部时面板会翻到精灵上方）；由于药丸本身属于悬浮容器，悬停它会先弹出面板再把自己盖住——这种状态下玩法入口根本无法点击。

## Decision

玩法入口现在并入悬浮面板。宠物声明 gameplay 时，面板操作行新增「玩法」按钮，通过每条宠物共享的 `GameplayBus` 上的新 `openCard` 通道（`packages/dsh-pet/src/client/gameplay-hud.tsx`）打开/关闭玩法卡片——由 HUD 注册、chrome 调用，与 `tap` 的流向一致。悬浮药丸被删除：`.gameplayToggle` 规则从 `pet.module.css` 移除，卡片保留自己的关闭按钮。chrome 接线：`PetSprite` 仅在传入 `onGameplayMenu` 时渲染该按钮，`PetDockEntry` 转发到 `aux.bus.openCard?.()`；无 gameplay 块的宠物保持三按钮面板不变。玩法卡片根节点仍带 `data-dsh-pet-gameplay`，语义属性契约无变化。

## Alternatives considered

- **保留药丸并挪到精灵侧面**（右缘垂直居中）：任何摆位都不会再撞面板，但宠物可以被拖到贴住视口边缘，侧面药丸会被裁切，锚点侧需要按剩余空间实测翻转；且宠物仍然有两个互争的 chrome 面。
- **面板打开时隐藏药丸**：药丸在悬浮容器内，悬停它必然先弹出面板——按悬停隐藏会让入口永远点不到，与修复目标相反。
- **把面板下移到药丸下方**：面板是内容自适应尺寸的浮动卡片，宠物坞又贴着视口底边，下移只会让面板出屏或更频繁翻到上方，等于转移冲突而非消除它。

## Consequences

每只宠物只有一个控制面：喂食/改名/隐藏与玩法都集中在悬浮面板，打开卡片不再需要先绕开遮挡物。玩法宠物的面板多一枚按钮（四个动作），仍居中挂在精灵正下方。客户端 bundle 需重新构建后变更才能到达浏览器。

## Testing

`pnpm --filter @linxin666/dsh-pet typecheck`、`test`（431 通过）与 `build` 全部通过。gameplay-hud 测试通过 `bus.openCard` 驱动卡片（打开、无参切换、显式布尔、关闭按钮），PetSprite 测试覆盖面板按钮：玩法宠物渲染、无 HUD 宠物不渲染、语音包隐藏全部面板动作时仍保留。实机 GUI 验证待客户端 bundle 重载后进行。
