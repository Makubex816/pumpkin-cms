# Reusable Runtime QA Pattern

Phase 2H-21 adds a reusable local runtime QA helper at:

```text
apps/admin/scripts/runtime-qa-harness.mjs
```

The Outbound Link Manager phase-specific check uses it through:

```text
apps/admin/scripts/phase-2h21-runtime-qa-provider-readiness-check.mjs
```

## How A Module Plugs In

1. Define the route, screen, service, or Electron surface under test.
2. Provide required marker groups for route wiring, UI affordances, provider messaging, and provider-state type contracts.
3. Provide local source roots to scan for uncontrolled write calls and protected config references.
4. Add module-specific custom checks only when they are local and deterministic.
5. Write evidence to an ignored `.tmp/<phase-or-module>/...` folder.
6. Record whether browser automation is available at runtime; do not install it during a guarded phase unless explicitly approved.

## Provider Modes

- `local/offline`: default mode; fixtures and file-backed stores only.
- `fake-provider`: Admin/API data shape validation without live service calls.
- `staging-simulated`: local `.tmp` provider store writes are allowed only when the phase explicitly permits simulated writes.
- `live-readonly`: runtime QA may verify read-only provider messaging, but write execution stays blocked.
- `live-write-approved`: future mode only; must require explicit approval, provider validation, rollback evidence, Backup Center evidence, Resource Registry refresh, and operator signoff before any real write path is reachable.

## Required Safety Checks

- No protected config reads, including `.env.local`, `appsettings.Development.json`, `local.settings.json`, connection strings, account keys, SAS values, auth headers, cookies, or token prints.
- No live CMS writes, Azure mutations, storage mutations, external crawling, deployment, indexing, or live-page publication.
- No uncontrolled `fetch`, `XMLHttpRequest`, `axios`, `POST`, `PUT`, `PATCH`, or `DELETE` patterns in a read-only or gated phase.
- Provider-mode messaging must distinguish local, fake, staging-simulated, live-readonly, and future live-write-approved states.

## Browser Tooling Rule

The reusable harness records two signals:

- browser automation metadata detected in package files
- browser automation runtime installed in `node_modules`

If runtime tooling is unavailable, the harness stays in `node-runtime-safe-source-route-harness` mode and documents that limitation. If runtime tooling is already installed and safe, a future module may add a browser check without writing generated browser artifacts outside ignored `.tmp` output.

