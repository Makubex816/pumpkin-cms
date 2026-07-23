# PUB-30-A01 static publisher and onboarding productization

Status: `blocked_dpapi_provider_or_deployment_security`.

PUB-30-A01 completed repository-safe local productization for deterministic tenant artifacts, immutable release/publication records, resumable jobs, a Free-tier Static Web Apps deployment abstraction, a fail-closed Admin/TenantAdmin publication center, and publication-bound public-form contracts.

The final technical source commit is `aab6823bd265cf91e77868a6649dd984016837b9`. Two isolated clean roots passed the local acceptance matrix from that exact commit. Candidate generation produced identical 24-file inventories in both roots, and the frozen API and Admin deployment archives were byte-identical across roots. Those packages were validated but not deployed.

A read-only API settings hash diagnostic exposed protected API configuration values in the command trace. It did not write a file, enter a commit, mutate live state, deploy an application, or issue a form submission. The values are deliberately absent from this package. API, Admin, starter, and synthetic Static Web App deployment and all retained-synthetic mutation are held until the owner explicitly authorizes rotation of the affected platform secrets and a production-parity recovery/readback sequence.

No customer frontend was deployed. No customer tenant, credential, form, domain, DNS, TLS, indexing, capacity, payment, Airstrip runtime, or email state was changed.

Known focused source commits:

- dependency locks and frozen attribution: `c176ec3fd49e6cae400d0d30626425087d6077b8`;
- gated Admin/TenantAdmin publication center: `afb089ee40625c3651add122d396686c1f2b8d2e`;
- initial publisher, orchestrator, and package product: `e84befee`;
- root acceptance integration: `7e6534a`;
- API release/publication registry and public-form lifecycle: `4b5741c5`;
- lifecycle targeting and deterministic build hardening: `27058f39`, `a3677864`, `0b5ae2c0`, `973f0366`, `dc02e863`;
- generated-package line-ending contract and final technical source: `aab6823bd265cf91e77868a6649dd984016837b9`.

This directory contains exactly the 22 required repository-safe result files. The separate PUB-40, held DOM-20, and conditional SEC-20 handoff prompts live beside this directory and are not counted in its file total.

The result closeout and Atlas authority commits are necessarily later than the technical source commit. Their identities are recorded by Git history and the repository authority pointer, avoiding a circular commit hash inside this immutable result package.
