# V2.6 Runtime QA Carryforward

Carried forward from V2.6.1:

- Reusable local/offline Runtime QA harness.
- Runtime QA registry and evidence-manifest validator.
- Local Admin route checks.
- API read-only and write-guard checks.
- Provider-mode matrix covering local/offline, fake-provider, staging-simulated, live-readonly, live-write-approved, and production-runtime.
- Runtime QA upload blocker.

V2.7.1 added:

- `fixtures/runtime-qa-registry.v2-7-1.fixture.json`
- `npm run run:v2-7-1`
- `npm run validate:v2-7-1`
- `npm run inspect:v2-7-1`

Evidence:

- Run ID: `runtimeqa_e25ad7f3a49faaa5`
- Status: `passed`
- Checks: `15`
- Blocked checks: `0`
- Validation: `passed`
- Warning: Runtime QA upload blocker carried forward.
