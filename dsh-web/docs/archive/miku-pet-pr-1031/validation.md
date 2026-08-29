# miku-pet 收录验证记录（PR #1031）

验证对象：PR #1031（feat(miku-pet): add Miku pet plugin package）完成分支
rebase 到 `origin/dev`（基线 7d74275a1）后的真实 DSH Web GUI 验证。
本分支补齐：/miku-pet/config 写接口的同源守卫（共享 loopback fence）与
路由级测试、Miku 角色权利 NOTICE.md 与 README 许可边界、semantic-attrs
契约对应的 data-dsh-part 客户端锚点。

## 环境

- 隔离 scratch 实例：DSH_HOME=/tmp/scratch1031/home，profile web，
  聚合包 tarball 由本分支家族包 pack 覆盖（含 @linxin666/dsh-miku-pet，
  aggregate 19 rows / 18 deps），`dsh web --port 3092`（keyless）。
- 浏览器：headless Chromium（Playwright），桌面 1440×900 / 窄屏 390×844。

## 验证结果

1. 渲染与动画：`[data-dsh-part="sprite"]` 舞台 220×220 渲染；550ms 两帧
   截图字节不同（52812/52713）—— 帧动画在跑（home-miku-sprite.png、
   animation-frame-a/b.png）。
2. 悬停菜单与属性：鼠标悬停后 `data-dsh-part="menu"` 与 `stat` 均出现
   （hover-menu-stats.png）。
3. 商店弹层：点击「商店」后 `data-dsh-part="shop"` 出现（shop-modal.png），
   点遮罩关闭后计数归 0。
4. 拖拽持久化：mouse down/move(+130,+70)/up 后舞台位移（x 1200→1220,
   y 118→188），localStorage `miku-pet:pos:main` 写入
   {rx:1,ry:0.306,corner:"top-right"}（after-drag.png）—— 拖拽位置
   刷新后保持（设计上存 localStorage，不写入 /miku-pet/config）。
5. 设置保存/重置：Pet Config 设置页修改大小 180 → 保存 →
   `GET /miku-pet/config` 返回 {pets:[{id:"main",size:180,...}]}
   （pet-config-settings.png）；「Reset to default」确认后配置清空
   （{}，after-reset.png）。
6. 窄屏：390×844 下舞台完整在视口内（narrow-390.png）。
7. 路由守卫（单元层面）：tests/config-fence.spec.ts 6 项 —— 跨站/异源/
   非回环 socket 的 PUT、DELETE 一律 403 且不落盘；同源 PUT 200 并写入
   净化配置、同源 DELETE 200 并删除。
8. 环境无 pageerror；console error 0 条（引导期之外）。

## 边界说明

- 禁用/卸载清理：插件管理器的「Plugin list」对聚合子行（include:web-ui-miku-pet）
  仅展示 Configuration/Cordis 状态，无独立启停控件；「Plugin manager」只对
  聚合包行提供 On/Uninstall（卸载聚合包需重启生效）。子行级触发路径未在 GUI
  暴露，故未做禁用态清理断言；清理依赖 client fiber dispose + mountOnce
  单实例守护，与仓库其余家族插件一致（未验证项，如实记录）。

## 门禁

rebase 并补齐后仓库门禁全绿：pnpm sync-shared:check / typecheck / test
/ test:scripts / runtime-deps:check / docs:check / aggregate:check（19 rows,
18 deps）/ market:check（dist up to date 259 files）。
