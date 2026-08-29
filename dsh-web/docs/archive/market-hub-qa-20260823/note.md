# DSH 市场 hub 实机验证（2026-08-23）

隔离验证：临时 DSH_HOME + 独立端口（3089）的 dsh web 实例，profile 为清理后的完整 web profile
（去除与聚合行重复的 archive-manager / better-sidebar / doctor 直接挂载项），仓库 link: 全家桶。

## 结果

- 设置导航唯一市场族入口：通用设置 / 模型 / 插件 / Agent 预设 / 子代理 / Codex 订阅 / Web UI 插件 /
  **DSH 市场** / 归档管理 —— 皮肤中心、宠物、社区插件、市场 四个旧入口不再出现。
- DSH 市场 hub：标题「DSH 市场」，页签 商店（默认）/ 皮肤中心（主皮肤中心卡片：试穿/应用/背景控件）/
  宠物（宠物选择 + 状态装饰）/ 社区插件（39 条索引 + 安装面）。
- 新装默认皮肤：干净 home 首次启动后 `skin-center-active.json` = {"active": "blue-fantasy"}，
  页面蓝色幻想背景已渲染（截图）。
- 门店卡片数据来自 dsh-market.com（18 皮肤 / 2 宠物 / 39 插件），商店页签显示市场卡片内容。

## 期间发现并修复

- hub 的 marketTabs observable 每次 getSnapshot 重建数组引发 React #185（最大更新深度）——
  hub 槽位崩溃；已按条目引用缓存快照并加单测（packages/dsh-market/tests/market-hub.spec.tsx）。
- 用户 profile 直接挂载 archive-manager / better-sidebar / doctor 与聚合行重复，导致任意新启
  dsh web 失败（archive-manager 重复路由）；已从 `~/.dsh/profiles/web/package.json` 移除三项
  （备份 package.json.bak-before-market-hub-20260823），清理后的完整 profile 新启成功。

## 截图

- hub-dsh-market.png：设置 → DSH 市场（页签栏 + 商店卡片）。
- tab-skin-center.png：皮肤中心页签。
- tab-shop.png：商店页签。
