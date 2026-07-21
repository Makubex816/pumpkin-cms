# Canonical Full-Scope Build Map v3.0

## Outcome

Create a qualified downstream product that incorporates the partner's new CAPTCHA and visual-editor foundations, preserves the current multi-tenant build, completes the universal lead system, maintains a continuously updated Atlas, and remains ready for a later Authorize.Net intake.

## Operating sequence

```text
Protect current live phase
→ ingest complete closeout
→ inventory active source and Atlas
→ recheck upstream head
→ freeze immutable snapshot
→ clean-room qualify
→ semantic overlap analysis
→ integrate shared primitives
→ close CAPTCHA gaps
→ integrate visual editor with downstream roles
→ complete universal forms/leads contract
→ tenant reconciliation
→ staged release
→ Atlas/package/chat regeneration
```

## PATH A — Current build closeout and truth capture

### `CUR-10` Protect the running phase

- zero upstream merges, deployments, credential changes, live form posts, or Atlas replacement;
- retain the current phase as the authority for current system behavior;
- await a complete success/partial/failure closeout.

### `CUR-20` Ingest current build closeout

Required evidence:

```text
repository and branch
source and merge commits
worktree/staging status
allowed files changed
deployment IDs and artifact hashes
preflight and clean-room results
live submission/correlation IDs
FormEntry exact readback
TenantAdmin and SuperAdmin readback/isolation
final per-tenant form modes
remaining blockers
active Atlas path, version, and update command
next safe gate
```

Hard stop: any mismatch between narrative, Git, deployment, and live readback.

## PATH B — Immutable upstream intake

### `UP-10` Source observation — complete for candidate

- candidate: `18b5cea01d23298b95b5945999e66a4aec8d748b`;
- previous observation: `785e079269276c177832f9e7186ae44675e76f52`;
- delta: five commits and 43 paths;
- source analysis captured in v3 evidence.

### `UP-20` Recheck and freeze

Immediately before Git writes:

```text
fetch upstream
prove head stability
record full commit/tree/parents
verify ancestry from previous baseline
create protected immutable branch/tag
create archive and Git bundle
hash every artifact
record provenance in Atlas
```

If upstream advanced again, create a new intake report; do not silently move the candidate.

### `UP-30` Clean-room qualification

From the frozen commit only:

- restore/build .NET API, models, and test utility;
- run `--run-tests` contract suite explicitly;
- restore/build/type-check/lint TypeScript models, block views, and starter app;
- scan source and generated artifacts for secrets, local paths, deploy ZIPs, and protected files;
- execute deterministic fixture and serialization tests;
- produce SBOM/dependency and vulnerability reports where tooling exists;
- record that no GitHub status/workflow evidence accompanied the source, so local qualification is authoritative.

## PATH C — Semantic reconciliation with active downstream

### `INT-10` Three-way capability inventory

Compare:

```text
previous qualified upstream
new qualified upstream
current active downstream product
```

For every subsystem, record incoming paths, downstream paths, contract overlap, data migration, decision, validation, rollback, and Atlas update.

### `INT-20` Product branch strategy

- preserve all current product branches/worktrees first;
- create a bounded integration branch from the active downstream product;
- do not reset product history to upstream;
- replay or port shared-core changes in ordered slices;
- keep product-only control-plane behavior separate from shared-core edits where possible.

## PATH D — CAPTCHA adoption and hardening

### `CAP-10` Adopt upstream contract — decision complete

Preserve:

- tenant defaults;
- per-form inherit/required/disabled modes;
- secret references rather than secret values;
- public site-key resolution;
- server-side action and hostname checks;
- shared Turnstile widget and form editor controls.

### `CAP-20` Close production gaps

- add verification-request idempotency key or equivalent bounded retry semantics;
- reset/invalidate client token on every attempt that may consume it, including non-OK server responses;
- map provider/network/timeout failures to explicit retryable/nonretryable results;
- capture structured provider error codes without raw token or secret;
- require production allowed-hostname configuration;
- document and test CSP;
- add expiry, replay, hostname, action, outage, malformed token, oversize token, duplicate submit, and concurrency tests;
- place CAPTCHA inside the broader idempotent submission transaction.

### `CAP-30` Tenant rollout

For Ice, Party Pros, Airstrip, Vegas, and every other active tenant:

- configure tenant site key, secret reference, allowed hostnames, and default policy;
- reconcile FormDefinition override/action;
- use official provider test keys in nonproduction;
- perform one controlled production proof only under a dedicated phase budget;
- read back exactly one FormEntry and prove cross-tenant denial;
- record CAPTCHA status independently from lead persistence and notifications.

## PATH E — Visual editor integration

### `VE-10` Upstream assessment — complete

The visual editor is a strong starter primitive and should not be rebuilt from scratch.

### `VE-20` Data/model migration

- add/preserve block `id`, `name`, and `enabled` in .NET and TypeScript contracts;
- inventory all current page fixtures and stored pages;
- deterministically backfill missing IDs without changing content or order;
- prove all known block types round-trip;
- decide whether IDs are immutable after creation;
- preserve unknown/custom blocks.

### `VE-30` Downstream role and tenant adapters

- TenantAdmin edits only its configured tenant;
- SuperAdmin may enter a tenant context through explicit authorization;
- no tenant ID is accepted from an untrusted browser when server context already owns it;
- draft/preview/save/revalidate operations remain tenant scoped;
- audit actor, tenant, page/theme, old/new version, and correlation ID.

### `VE-40` Reliability and security

- optimistic concurrency or ETag/version conflict detection;
- response/readback validation for page, theme, navigation, and revalidation saves;
- authenticated preview plus iframe/CSP/sandbox threat review;
- prevent preview navigation and submission, with server routes still enforcing no-write preview modes where required;
- sanitize rich content through a maintained HTML sanitizer or equivalent trusted policy;
- browser E2E for insert/edit/move/duplicate/delete/save/reload and responsive preview;
- rollback and legacy-editor coexistence plan.

## PATH F — Universal forms, leads, and notifications

### `FORM-10` Canonical contract inventory

- every form instance maps to one active FormDefinition;
- FormEntry remains authoritative;
- email remains optional and secondary;
- upstream CAPTCHA settings are incorporated rather than duplicated.

### `FORM-20` Exact-one persistence

Add/verify:

```text
submissionId
correlationId
idempotencyKey or deterministic uniqueness contract
created/duplicate/readback result
ambiguous-timeout recovery
```

The same logical submission must never produce multiple FormEntries.

### `FORM-30` Role-separated inbox

- TenantAdmin list/open/update/export only its tenant;
- SuperAdmin list/open/update/export across explicit tenant contexts;
- same FormEntry ID inaccessible through another tenant;
- audit status changes and export events;
- public starter inbox and downstream control plane share API contracts without sharing unauthorized UI scope.

### `FORM-40` Notification lifecycle

- persistence completes independently;
- notification recipient comes from mutable tenant/form settings, not login identity;
- delivery attempts and status are separate records/fields;
- retries are idempotent and never recreate the FormEntry.

## PATH G — Tenant onboarding and reconciliation

For every current tenant and future tenant launch:

```text
no-write preflight
canonical definitions
CAPTCHA configuration proof
one controlled persistence proof
exact readback
TenantAdmin visibility
cross-tenant denial
notification status
public form mode
visual-editor role check
Atlas update
```

## PATH H — Authorize.Net and payments

`PAY-00` remains externally blocked. When a partner push is visible:

- inspect source before designing around it;
- classify tenant configuration, hosted/tokenized payment path, webhooks, transaction lifecycle, secrets, idempotency, and refunds;
- never treat tenant config alone as completed payments;
- keep PaymentIntent/Attempt/Transaction/Event separate from FormEntry.

## PATH I — Atlas, package, and chat migration

After every major milestone or completed build path:

```text
closeout validates
→ evidence index updates
→ Atlas capability and milestone records update
→ current-state/resumption update
→ CHAT-PACK regenerates
→ package validates
→ deterministic ZIP and checksum regenerate
```

After the current build succeeds, load the **validated v3 package plus its ingested closeout update** into the existing system chat. Do not upload this pre-closeout package as though it contains current runtime truth.

## Final program acceptance

- exact upstream lineage is immutable and reproducible;
- current downstream capabilities are preserved;
- CAPTCHA is server verified, replay-safe, retry-safe, tenant scoped, and proven;
- visual editing is role scoped, migration safe, concurrency safe, and rollback capable;
- every live form produces exactly one tenant-scoped FormEntry;
- role-separated inbox and cross-tenant denial are proven;
- notification failure cannot lose a lead;
- all tenants pass one launch/reconciliation contract;
- Atlas, evidence, chat pack, ZIP, and checksums agree.
