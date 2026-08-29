# Agent Note: Aggregate bundles pass harness row patches through verbatim

Status: implemented

## Problem

dsh-perf bundles two kinds of patch content: its own plugin row (an `- insert:` row carrying runtime config) and a bare top-level row that patches the official harness row `session-persistence-jsonl` (write-behind delay 200ms -> 500ms, restating every key the base row owns). The aggregate generator (`scripts/aggregate.mjs`) only understood `- id:` rows followed by `name:` and rendered every block as `- insert:` with a namespaced id. Feeding dsh-perf's patch through it produced a `web-ui-session-persistence-jsonl` insert row: the official row was never patched (the write-behind optimization silently lost) and a second row with the same plugin `name` mounted alongside it, a double-mount risk.

## Decision

- `scripts/aggregate.mjs` now parses a child's `cordis.patch.yml` into row blocks with two kinds. `insert` rows (inside a `- insert:` block) keep the namespacing and now also preserve `config` lines. `patch` rows (top-level `- id:`, no insert wrapper) pass through verbatim — original id, `name`, and `config` — so they address the already-mounted harness row by id, exactly like a standalone install.
- `packages/dsh-perf/cordis.patch.yml` gains the required `name:` line on the harness-row patch (the generator's parse contract demands a name right after the id).
- `packages/dsh-web-all/aggregate.yml` adds `../dsh-perf` to both `patchFrom` and `deps`; the regenerated aggregate ships `web-ui-dsh-perf` (with config) and the verbatim `session-persistence-jsonl` patch. dsh-perf publishes at the unified family version for the first time in v0.3.5.
- Restated keys were verified against the official `@deepseek-ai/dsh-session-persistence-jsonl` schema defaults: `packChunks: true`, `compression: zstd`, `preparedSessionCacheSize: 5` all match; only `writeBatchMaxDelayMs` intentionally differs (500 vs 200).

## Alternatives considered

- Keep the generator unchanged and drop the harness-row patch from dsh-perf: rejected — the write-behind batching is a core dsh-perf feature (per-batch disk sync ~2.5x reduction during streaming), and silently losing it inside the aggregate is not acceptable.
- Let the generator namespace the bare row as-is (its original behavior): rejected — `web-ui-session-persistence-jsonl` is a new id mounting the same plugin name beside the official row, a double mount with undefined load order.
- Switch the generator's parser to a general YAML library: rejected — the repository has no js-yaml/yaml dependency, and the existing `parseManifest` already establishes the hand-rolled YAML-subset scanning style; extending it keeps the file format and error paths consistent.

## Consequences

- The aggregate now reports 20 rows / 18 deps; `aggregate:check`, the aggregate script tests (5/5), `pnpm test:scripts` (211/211), and the dsh-web-all and dsh-perf package tests stay green.
- Installers of `@linxin666/dsh-web-all` from v0.3.5 on get dsh-perf enabled by default (row config: meter 2000ms, window 120s) and the harness write-behind delay at 500ms.
- Future child packages that need to patch an existing harness row write a bare top-level `- id:` row (with name and config) in their `cordis.patch.yml`; the aggregator forwards it untouched. Patch rows from a child are meant to restate every key the target row owns — the whole config is replaced, never merged.
