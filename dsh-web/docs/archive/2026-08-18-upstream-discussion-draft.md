# A stable theming seam for the community skin ecosystem (proposal)

> Context: we maintain the dsh-web-ui community plugin/skin family. We are rebuilding our skin center so that skins become pure asset directories (CSS + images) that remap the official `--dsw-*` tokens and style documented semantic hooks. Before we finalize the contract, we would like to align with upstream on the smallest possible supported seam. This is a discussion request, not a PR — per CONTRIBUTING we understand external PRs are not accepted at the moment; we are happy to contribute in whatever form you prefer.

## What we found (rc.7, verified against the source)

1. **The token contract exists but is not documented as one.** `@deepseek-ai/dsh-client-ui-theme` defines 350 unique `--dsw-*` tokens (design-platform.css / gradient-shadow-text.css / base.css); `docs/web-styling.md` assigns ownership but no documented stable subset. `BUILTIN_INSPECT_TOKENS` already enumerates 13 core semantic tokens — a natural seed for a documented theming surface (even as "documented extension point, subject to change until 1.0").
2. **`webServer.tapIndex` is already a public, catalogued API**, and ui-theme's own boot-theme injection is a production precedent for pre-paint `html`/`body` attribute stamping. Third-party use only lacks a short prose pointer in the subsystem docs.
3. **`ctx.theme` (ThemeRuntime) already supports third-party themes** (`register` / `overrideTokens` with stacking and dispose). The README itself notes it is "an extension point, not a product". We would love to know whether you see this becoming a supported product surface; if so, our L1 layer would rather ride it than inject scoped CSS.

## Token gaps we hit in practice (all verified: used but never defined)

| Token | Used by | Defined anywhere |
| --- | --- | --- |
| `--dsw-alias-label-error` | 5 community plugins, 25 references without fallback | No — error text silently loses its color |
| `--dsw-alias-separator-primary` | `dsh-client-ui-conversation` itself (inline CSS), plus 2 plugins | No |
| `--dsw-alias-line-secondary` | `dsh-client-ui-conversation` itself | No |
| `--dsw-alias-tooltip-fg` | de-facto standard: 8 community skins define it privately | Only `tooltip-bg` exists |

Defining these four in ui-theme would fix a live first-party bug (conversation references two undefined tokens) and let the ecosystem delete its private shadow definitions.

## DOM hooks we would love to see first-party

Our semantic adapter currently stamps `data-dsh-surface` / `data-dsh-part` / `data-dsh-plugin` onto the shell DOM from stable anchors. Most anchors are great (`data-slot` outlets, `data-chat-flow-kind`). Four gaps force fragile substring matching on CSS-module hashes:

1. **AppFrame column containers** (sidebarCol / centerCol / detailsCol) have only hash class names. A stable `data-pane` (or any data hook) on the three columns would remove the most fragile selector in the ecosystem.
2. **A sidebar navigation list slot** — community plugins currently inject nav rows via DOM surgery after the New Session button.
3. **A dedicated attribute on the settings dialog root** — today it is only distinguishable from other `role="dialog"` overlays by descendant-slot sniffing.
4. **Slot-entry DOM attribution** — list-slot entries carry no DOM marker of which plugin registered them; passing the entry id through (e.g. `data-slot-entry`) would give plugin-owned DOM a zero-guess identity.

## What we are NOT asking for

No new config fields, bootstrap hooks, or runtime mechanisms; no stability promise beyond what you are comfortable with before 1.0; no changes to token names or values. The ask is: bless a minimal seam (documented tokens + tapIndex usage + the four DOM hooks), and tell us which parts you would rather own differently.

Happy to turn any subset of this into issues or a docs PR on your invitation.
