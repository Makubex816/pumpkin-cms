# Platform Runtime QA Harness Goal

Runtime QA should be a reusable PumpkinCMS platform capability, not a one-off Outbound Link Manager check.

The harness pattern supports future Admin modules, API provider-state views, gated write workflows, Backup Center surfaces, Resource Registry views, tenant bundle workflows, and future Electron operator cockpit screens.

## Requirements

- Support local/offline and fake-provider modes by default.
- Verify target screens or service boundaries without requiring live Azure, Cosmos, Storage, CMS writes, Cloudflare, DNS, deployment, indexing, or live publication.
- Detect uncontrolled write calls such as `POST`, `PUT`, `PATCH`, and `DELETE` when a phase is read-only or approval-gated.
- Verify provider-mode messaging for local, fake, staging-simulated, live-readonly, and future live-write-approved states.
- Capture generated evidence under ignored `.tmp` output only.
- Avoid protected config reads and never print secrets, tokens, cookies, connection strings, keys, or auth headers.
- Reuse the same local-safe pattern for future PumpkinCMS Admin, API, and Electron phases.
- Prefer automated browser checks only when tooling already exists and can run safely; otherwise use lightweight local source/route checks.

## Future Use Cases

- Outbound Link Manager Admin dashboard and action workflows.
- Backup Center generator and restore-plan dashboards.
- Resource Registry and encrypted handoff status views.
- Tenant onboarding and import package review screens.
- Provider readiness and local/live profile switching views.
- Future Electron operator cockpit screens.

## Non-Goals

- Do not install heavyweight browser tooling unless it is explicitly safe, dev/test-scoped, and approved.
- Do not require live provider access for local runtime QA.
- Do not use runtime QA as a backdoor for live writes.
- Do not stage generated browser artifacts, screenshots, traces, or `.tmp` evidence.

