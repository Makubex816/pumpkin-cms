# Pumpkin Platform Runtime QA Harness

This package operationalizes Runtime QA as a reusable local/offline platform harness.

## What It Provides

- A registry-driven check model for Admin routes, API read-only contracts, provider profile modes, Resource Registry bindings, Backup Center proof refs, and no-uncontrolled-write scans.
- A reusable evidence manifest format with required fields for route/API coverage, provider mode state, source evidence refs, blocked reasons, warnings, artifact paths, and security boundaries.
- A local `.tmp` evidence writer and validator.
- An optional upload command that is off by default and requires `--execute-upload`.

## Boundary

- Local evidence is written under ignored `.tmp/`.
- Source and evidence checks do not require protected config.
- No provider data writes, CMS writes, external crawling, deployment, indexing, or live publication are performed.
- Optional staging upload requires an explicit CLI flag and uses Azure Identity/RBAC through `az storage blob upload --auth-mode login`.
- The reusable default modes are local/offline, fake-provider, offline-bundle, local-file-backed, local-api-fake-provider, staging-simulated, live-readonly, live-write-approved scoped-only, and production-runtime blocked.

## Commands

```powershell
npm test
npm run check
npm run run:v2-6-1
npm run validate:v2-6-1
npm run inspect:v2-6-1
```

The V2.6.1 run writes:

- `.tmp/v2-6-1-runtime-qa-evidence/RUNTIME_QA_EVIDENCE_MANIFEST.json`
- `.tmp/v2-6-1-runtime-qa-evidence/RUNTIME_QA_EVIDENCE_SUMMARY.md`
- `.tmp/v2-6-1-runtime-qa-evidence/RUNTIME_QA_VALIDATION_RESULT.json`
- `.tmp/v2-6-1-runtime-qa-evidence/RUNTIME_QA_VALIDATION_RESULT.md`

Optional upload, only after local validation passes and Storage/RBAC access is confirmed:

```powershell
node src/runtime-qa-cli.mjs upload-evidence --evidence .tmp/v2-6-1-runtime-qa-evidence --account pumpkincmsstgolm01 --container runtime-qa-staging --prefix v2-6-1/runtime-qa-evidence-binding --execute-upload
```

## Reuse Pattern

Future PumpkinCMS Admin/API/Electron modules should add a registry fixture with:

- checked routes and APIs,
- safe source roots,
- marker checks for provider-mode messaging and disabled/gated writes,
- Resource Registry/provider profile evidence refs,
- local/offline and fake-provider modes,
- a no-uncontrolled-write scan,
- a `.tmp` evidence output path.

Modules must not require protected config or live writes for local Runtime QA. Browser automation can be layered on later, but the fallback pattern remains source/route/contract validation that runs offline.
