# Agent Note: Doctor Client Default API Base

Status: implemented

## Problem

The dsh-doctor settings card ("host status" panel) permanently showed "Doctor offline / endpoint unavailable" on every machine, regardless of the actual host state. The host half was healthy — `GET /api/doctor/status` answered 200 JSON with an armed supervisor snapshot — but the browser half never reached it: `DoctorApi` defaulted its `base` to `''`, so the request URL was assembled as `this.base + '/' + endpoint` = `/status`, bypassing the `/api/doctor` prefix entirely. The web server 404 for `/status` was classified as `not-available`, which the UI renders as "endpoint unavailable". The `DOCTOR_API_BASE` constant existed but was never referenced, and every test injected an explicit base, so the empty default was never exercised.

## Decision

`DoctorApi` now defaults `base` to `DOCTOR_API_BASE` (`/api/doctor`) in `packages/dsh-doctor/src/client/doctor-api.ts`; the explicit `base` override remains for tests. A regression test in `packages/dsh-doctor/tests/client-doctor-api.spec.ts` constructs `DoctorApi` without a base and asserts the fetch URL is `/api/doctor/status`.

## Alternatives considered

- **Pass `DOCTOR_API_BASE` at each construction site** (`src/client/index.ts`, the controller default): fixes the same symptom but leaves the footgun in place — the next `new DoctorApi()) without arguments would silently break again. Defaulting in the constructor makes the correct path the zero-effort path.
- **Derive the base from `window.location` or a config service**: the route family is a fixed same-origin loopback API owned by the host half; there is nothing to configure, so added indirection buys nothing.

## Consequences

The recovery console now talks to the real host endpoint; "endpoint unavailable" is again meaningful (host half disabled, unmounted, or a non-JSON SPA fallback) instead of a permanent false negative. The client bundle must be rebuilt for the fix to reach the browser; no host restart or profile change is required.

## Testing

`pnpm --filter @linxin666/dsh-doctor typecheck`, `test` (367 passed), and `build` all pass; verified live that `GET http://127.0.0.1:3080/api/doctor/status` returns 200 JSON while `/status` returns 404.
