# dsh-market try-on shell (vendored webdsh)

This directory vendors [futrime/webdsh](https://github.com/futrime/webdsh)
(Apache-2.0, (c) Zijian Zhang) — "DeepSeek Harness in a browser tab": the real
dsh web client and the real host composition run entirely in the page, and the
whole thing deploys as static files.

Purpose here: the dsh-market.com skin try-on at `/tryon/`. The real client DOM
plus the real skin runtime (`@linxin666/dsh-client-ui-skin-center`) make the
preview identical to a local install.

## Vendor policy

- Upstream files are committed as-is (only the `.git` history and
  `src/generated/` outputs are omitted; `src/generated` is produced by
  `npm run assemble`).
- Local modifications are marked with a comment header `// market/tryon: ...`
  or `# market/tryon: ...` and documented in `docs/local-changes.md`.
- To re-sync with upstream: replace the tree with a fresh checkout of the same
  upstream commit, then re-apply `docs/local-changes.md` (and re-run
  `scripts/market-build`).
- Keep the upstream `LICENSE` and this file.

## Local build

```sh
cd market/shell
npm ci
npm run build        # → dist/
```

`scripts/market-build` copies `market/shell/dist` to `market/dist/tryon`
(the shell works under any subpath by design — all URLs are relative).
