# Preliminary semantic dispositions

- LICENSING_AND_ATTRIBUTION: `ADAPT_OR_PORT` — Apache-2.0 LICENSE/NOTICE must be carried forward with attribution review.
- SCHEMA_FIRST_BLOCK_CONTRACTS: `ADAPT_OR_PORT` — Schema-first contracts are likely useful but need downstream contract parity review.
- GENERATED_DOTNET_MODELS: `ADAPT_OR_PORT` — Generated outputs must be regenerated/verified in clean room.
- GENERATED_TYPESCRIPT_MODELS: `ADAPT_OR_PORT` — Package fidelity and downstream TS consumers need parity checks.
- API_RUNTIME: `CONFLICT_REQUIRING_DESIGN` — API registration/runtime changes may collide with tenant-scoped downstream APIs.
- STARTER_RUNTIME: `WRAP_AND_EXTEND` — Starter runtime must preserve custom-host routing and tenant runtime keys.
- VISUAL_EDITOR: `ADAPT_OR_PORT` — Visual-editor behavior should be ported only after role/scope/readback proof.
- THEME_AND_STYLES: `ADAPT_OR_PORT` — Theme/style changes need tenant-specific runtime validation.
- FORMS_AND_CAPTCHA: `DEFER` — No new payment/CAPTCHA integration is authorized in UP-20.
- TENANT_AND_IDENTITY: `SUPERSEDED_BY_DOWNSTREAM` — Downstream identity foundation is newer and protected.
- ONBOARDING: `UNKNOWN_PENDING_EVIDENCE` — No final disposition until UP-30/INT-10.
- DEPLOYMENT_AND_WORKFLOWS: `UNKNOWN_PENDING_EVIDENCE` — No workflow definitions observed; build scripts require qualification.
- PAYMENTS: `DEFER` — PAY-00 remains blocked pending source qualification.
- DOCUMENTATION: `DIRECT_ADOPT` — Safe documentation may be adopted after license/provenance review.
- UNKNOWN: `UNKNOWN_PENDING_EVIDENCE` — UP-30/INT-10 must classify remaining file-level deltas.
