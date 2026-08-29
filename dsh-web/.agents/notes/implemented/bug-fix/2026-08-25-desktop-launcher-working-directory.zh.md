# Agent Note: 桌面启动器快捷方式工作目录隔离

状态：已实现 (implemented)

## 问题背景

在 Windows 下使用 `dsh-desktop-launcher` 生成快捷方式时，`renderShortcutInstaller` 将 `$shortcut.WorkingDirectory` 设置为用户主目录（`~`）。通过桌面快捷方式启动 DSH 时，DSH 会加载主目录中的 `.env` 文件。若主目录中存在其他应用程序的 `.env` 且包含 `DEEPSEEK_BASE_URL` 等仅限引导环境设定的变量，DSH 会在绑定 3080 端口前直接退出：
```text
dsh: <user-home>/.env sets "DEEPSEEK_BASE_URL", which only the launching environment may set
```
由于快捷方式默认使用隐藏窗口并忽略非致命错误，导致桌面图标双击后静默闪退、Web 服务无法启动。

## 技术决策

1. 在 `packages/dsh-desktop-launcher/src/core/launcher.ts` 中，为 `renderShortcutInstaller` 增加 `workingDirectory` 参数支持（保留 `homeDir` 作为向后兼容备选）。
2. 在 `packages/dsh-desktop-launcher/src/routes.ts` 中，将 `workingDirectory` 指定为独立的 `scriptsDir`（即 `~/.dsh/desktop-launcher`）。
3. 在 `launcher.spec.ts` 与 `routes.spec.ts` 中补充针对 `$shortcut.WorkingDirectory` 指向隔离目录的断言测试。

## 影响与收益

通过 Windows 桌面图标启动 DSH 时不再受用户主目录下无关 `.env` 文件的干扰，彻底避免了因第三方环境变量冲突导致的启动闪退问题。

## 验证结论

`pnpm --filter @linxin666/dsh-desktop-launcher test`（54 个用例通过）、全仓类型检查 `pnpm typecheck`、全仓测试 `pnpm test` 及门禁 `pnpm test:scripts` 全绿。
