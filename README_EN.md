# Dolphin — Proactive Security Patrol Plugin

> Transforming the penetration-testing methodology (Reconnaissance → Vulnerability Detection → Exploitation Validation → Reporting) into a **proactive defense patrol workflow**.
> Instead of waiting passively for alerts, Dolphin patrols your hosts on schedule — the way a dolphin swims its route.

Current release: **v0.1.0-beta** (Windows preview)

[简体中文](./README.md) | [English](./README_EN.md)

---

## ⚠️ Disclaimer

**This project is a technical research tool. Unauthorized penetration testing is strictly prohibited.**

- Use Dolphin **only** against systems and code that you own, or for which you have obtained **explicit written authorization**.
- Scanning, probing, or connecting to any third-party system without permission may violate applicable laws and regulations (including but not limited to cybersecurity and computer-misuse statutes).
- The authors accept no liability for any direct or indirect damage arising from the use, misuse, or abuse of this tool.
- **You must obtain explicit authorization before use.** The user bears full legal responsibility for their actions.

---

## Requirements

| Item | Requirement |
|---|---|
| OS | Windows 10 / 11 x64 |
| Node.js | **>= 20** (20 LTS or 22 LTS recommended) |
| Package manager | npm (bundled with Node.js) |
| Static analysis engine | **semgrep** (see installation below) |

---

## Installation

### 1. Install dependencies

```bash
npm install
```

> Pulls in `ssh2` (MIT) for remote SSH/SFTP capabilities.

### 2. Prerequisite: install semgrep and add it to PATH

Dolphin's scanning layer is powered by [semgrep](https://semgrep.dev) (LGPL-2.1). **semgrep must be installed and callable from the command line:**

```bash
pip install semgrep
```

Verify:

```bash
semgrep --version
```

A version string (e.g. `1.175.0`) confirms a working installation.

> **Windows note:** if `semgrep --version` reports "command not found", Python's `Scripts` directory is not on your PATH. Run `pip show semgrep`, replace the trailing `lib\site-packages` of the reported `Location` with `Scripts`, add that path to your system PATH, then restart your terminal.

---

## Features

### 1. Local scan (`--local`)

Run a static security scan against a local directory and archive a structured report:

```bash
node dolphin-patrol.js --local <directory>
```

Example:

```bash
node dolphin-patrol.js --local D:/your-project/src
```

### 2. Remote patrol (`--patrol`)

Dispatch the scan command to a remote host over SSH, collect the result, and archive it locally — the complete patrol loop.

**Register a host first** (see `test-ssh-hosts.js` for a ready-to-edit template):

```javascript
import { createHostStore } from './dolphin-ssh-core.js'
const store = createHostStore()
store.create({
  alias: 'server01',
  host: '192.168.1.10',
  port: 22,
  user: 'ops',
  auth: { kind: 'password', password: '...' },   // or { kind: 'key', privateKeyPath: '...' }
  tags: ['prod'],
  environment: 'production',
})
```

Then patrol:

```bash
node dolphin-patrol.js --patrol <alias> <remote-directory>
```

Example:

```bash
node dolphin-patrol.js --patrol server01 /srv/app
```

> Each patrol runs: connection health check → detect remote semgrep → dispatch scan → collect JSON → map to structured findings → archive locally.
> If the remote host has no semgrep, Dolphin uploads the scanner to a remote temp directory and executes it there (fallback path).

### 3. Logging and report generation

All results are normalized into the **SecurityFinding** model and archived as JSON:

```
D:\Dolphin\reports\
├── patrol-local-20260831-223652.json      # local scan report
├── patrol-server01-20260901-200652.json   # remote patrol report
└── dolphin-report-*.md / *.json           # reports from dolphin-core
```

Fields: `host` / `file` / `line` / `col` / `severity` / `checkId` / `message` / `remediationHint` / `metadata`.

### 4. Other entry points

```bash
node dolphin-patrol.js                     # self-test (25 assertions; 3 skipped if semgrep is absent)
node dolphin-core.js --mock [directory]    # dry-run the full pipeline with mock data (no semgrep needed)
node dolphin-ssh-core.js                   # SSH engine self-test (18 assertions)
node test-ssh-hosts.js                     # test host store + health-check failure path
node test-ssh-hosts.js --live              # spin up a local ssh2 server and verify the full patrol loop
```

---

## Architecture

Dolphin is built on three layers — the eyes, the hands, and the brain:

| Layer | File | Responsibility |
|---|---|---|
| **Scanning layer (eyes)** | `dolphin-core.js` | Semgrep wrapper; defines the unified `SecurityFinding` model |
| **Execution layer (hands)** | `dolphin-ssh-core.js` | SSH engine distilled from dsh-ssh; `exec` / `cluster` / `upload` / `download` / `test` |
| **Controller (brain)** | `dolphin-patrol.js` | Dispatches scans over SSH, collects JSON, structures and archives results |

---

## Programmatic usage

```javascript
import { runPatrol, runLocalScan, buildRemoteScanCommand } from 'dolphin'

// Local scan
const local = await runLocalScan('/path/to/project')
console.log(local.summary)   // { ERROR: 3, WARNING: 1, INFO: 0 }

// Remote patrol
const result = await runPatrol('server01', '/srv/app')
if (result.ok) console.log(result.reportFile)

// Build a remote scan command (pure function)
buildRemoteScanCommand('/srv/app', 'p/security-audit')
// → semgrep scan --config p/security-audit /srv/app --json
```

> When running `runPatrol` with an engine you created yourself, remember to call `engine.dispose()` when done — the engine holds a connection pool and keepalive timers that keep the Node event loop alive.

---

## Open source licenses

| Project | License | Usage |
|---|---|---|
| dsh-code-scan | MIT | Semgrep scanning wrapper, base scanning module |
| dsh-plugin-hos-forge-v2 | MIT | Reference for MCP orchestration |
| dsh-web (dsh-ssh subpackage) | Apache-2.0 | SSH/SFTP capabilities, distilled into `dolphin-ssh-core.js` |
| ssh2 | MIT | Underlying SSH protocol library |
| semgrep | LGPL-2.1 | Open-source static analysis engine |

Dolphin itself is released under the **MIT** license.

---

## Documentation

- [README.md](./README.md) — 简体中文
- [WINDOWS_PREVIEW_GUIDE.md](./WINDOWS_PREVIEW_GUIDE.md) — Windows preview setup guide
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) — Development log and pitfalls
- [docs/SSH_RECON_REPORT.md](./docs/SSH_RECON_REPORT.md) — dsh-ssh source recon report

---

## License

Released under [MIT](./LICENSE). Use legally, compliantly, and only with proper authorization.
