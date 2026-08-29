# Agent Note: Web Settings Bridge Allowlist for Market and Skin Namespaces

Status: implemented

## Problem

In `packages/dsh-web-settings/src/allowlist.ts`, `FAMILY_NAMESPACES` and `NAMESPACE_ALIASES` omitted `dsh-web-ui-market` (the Workshop market card namespace) as well as the skin center palette editor (`skin-custom-theme`) and wallpaper (`skin-wallpaper`) namespaces. Because the official rc.6 host-apiproxy hardcodes its product allowlist and rejects non-allowlisted namespaces with `settings-not-exposed`, the web-settings bridge must provide family fallback coverage out of the box. Without these namespaces in `FAMILY_NAMESPACES` and `NAMESPACE_ALIASES`, opening Settings -> Workshop showed "This setting section is not exposed (host namespace missing)" on clean default installations.

## Decision

1. In `packages/dsh-web-settings/src/allowlist.ts`, added `dsh-web-ui-market`, `skin-custom-theme`, and `skin-wallpaper` to `FAMILY_NAMESPACES`.
2. Added alias mappings for `dsh-market`, `dsh-client-ui-market`, `dsh-web-ui-market`, `market`, `skin-custom-theme`, and `skin-wallpaper` in `NAMESPACE_ALIASES`.
3. Updated unit tests in `allowlist.spec.ts` to assert that these namespaces resolve properly and are included in the default fallback allowlist.

## Consequences

Default installations without custom `web_settings_namespaces` configuration now properly expose the Workshop settings card and skin custom theme/wallpaper sections without "host namespace missing" errors.

## Testing

`pnpm --filter @linxin666/dsh-client-ui-web-ui-settings test` (66 passed), `pnpm typecheck`, `pnpm test`, and `pnpm test:scripts` all pass cleanly.
