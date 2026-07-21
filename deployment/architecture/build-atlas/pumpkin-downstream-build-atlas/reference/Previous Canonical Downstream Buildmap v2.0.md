# Full-Scope Build Map

## Program objective

Create a repeatable, evidence-gated downstream development system that:

- continuously absorbs useful upstream improvements;
- preserves downstream capabilities and history;
- freezes every accepted upstream source point immutably;
- reconciles overlapping public, private, and downstream control planes;
- completes universal internal lead capture;
- adds CAPTCHA without duplicate implementations;
- integrates Authorize.Net only after the promised upstream additive is visible and qualified;
- keeps crypto separate and gated;
- updates the existing Atlas and this package after every major milestone or completed build path.

## End-to-end operating chain

```text
Partner announces push
→ confirm new public SHA
→ preserve local downstream state
→ freeze exact upstream candidate
→ clean-room qualify candidate
→ semantic subsystem diff
→ classify each change
→ create bounded integration branch from product head
→ direct-adopt / adapt / wrap approved changes
→ migrate data/contracts if required
→ run shared + downstream + tenant regression matrices
→ merge qualified integration result
→ deploy through a separately authorized phase
→ authoritative readback
→ Atlas update
→ package and chat-pack regeneration
→ immutable closeout
```

## Program workstreams

### A. Downstream and Atlas inventory

Deliverables:

- active repository/worktree path;
- all remotes and branches;
- current product head and deployment branch;
- uncommitted/stashed/untracked state;
- local bundle and patch backup;
- current Atlas location and schema;
- current tenant/environment inventory;
- current deployment source mapping;
- current capability matrix.

No branch topology change is allowed before this inventory.

### B. Upstream intake and immutable provenance

Deliverables:

- final upstream commit and tree SHA;
- comparison from previous accepted upstream snapshot;
- changed-file and changed-contract inventories;
- annotated/signed tag and immutable reference after authorization;
- manifest, archive/bundle, and hashes;
- qualification status separate from snapshot status.

### C. Semantic change absorption

Every upstream change is classified as:

```text
direct_adopt
adapt_or_port
wrap_and_extend
conflict_requires_design
defer_external_dependency
reject_with_rationale
private_boundary_contract_only
supersedes_downstream
```

The result is an explicit reconciliation ledger, not a blind merge.

### D. Starter and control-plane reconciliation

Map equivalent behavior across:

- public starter single-tenant admin;
- downstream TenantAdmin;
- downstream SuperAdmin;
- partner private Pumpkin Cloud control plane;
- tenant runtime applications.

Preserve one canonical behavior per concern while allowing different shells and authorization scopes.

### E. Universal forms and lead system

Required capabilities:

- canonical active FormDefinition per live form;
- exactly-one FormEntry persistence;
- submission ID, correlation ID, and idempotency;
- tenant-scoped inbox/list/open/status/export;
- SuperAdmin cross-tenant access;
- same-entry cross-tenant denial;
- notification delivery after persistence;
- independent delivery status;
- no-email persistence proof;
- onboarding launch gate;
- tenant reconciliation.

### F. CAPTCHA and abuse protection

Layered controls:

```text
request/body limits
→ schema validation
→ honeypot
→ consent
→ pre-verification velocity controls
→ provider-neutral human verification
→ provider hostname/action checks
→ business validation
→ idempotency
→ distributed rate limiting
→ persistence
```

Inspect the next upstream push first. Reuse a correct upstream implementation; otherwise implement the provider-neutral Turnstile-first design.

### G. Authorize.Net payment lane

Current state: **blocked pending upstream push**.

After the push:

- identify the exact code and config added;
- determine whether it is only tenant configuration or a complete payment flow;
- inspect secret handling, public keys, sandbox/production separation, hosted/tokenized capture, webhooks, order linkage, duplicate protection, refunds, voids, and tests;
- choose direct adoption, adaptation, or replacement;
- keep payment records separate from FormEntry while allowing correlation to a lead/booking/order;
- require merchant underwriting and acceptable-use confirmation for each tenant/business class.

### H. Crypto lane

Separate future workstream. It cannot share an ambiguous “payment configured” status with Authorize.Net. Provider, custody model, settlement currency, refunds, confirmations, volatility handling, compliance, and tenant eligibility must be decided first.

### I. Onboarding and launch gates

Unify the best upstream and downstream onboarding behavior without collapsing ownership boundaries. New tenants cannot launch until configuration, forms, isolation, CAPTCHA policy, notifications, and any enabled payment method pass their own gates.

### J. Atlas and package lifecycle

No major milestone or build-path completion is closed until:

- the existing Atlas is updated;
- current state and capability matrix are reconciled;
- lineage and evidence are linked;
- decisions and risks are recorded;
- package validation passes;
- the deterministic ZIP and chat pack are regenerated;
- checksums are captured in the closeout.

## Phase map

| Phase | Name | Entry gate | Exit evidence |
|---|---|---|---|
| `DISC-00` | Preserve local state | Local build accessible | Bundle, worktree report, hashes |
| `DISC-10` | Inventory existing Atlas | Atlas path known | Schema/content/update-flow map |
| `UP-00` | Wait for confirmed push | Partner says merged | New SHA differs or explicit no-change result |
| `UP-10` | Read-only intake | New SHA visible | Commit/tree/diff report |
| `UP-20` | Freeze candidate | Intake passed; owner authorizes writes | Immutable ref/tag/manifest/archive |
| `UP-30` | Clean-room qualification | Candidate frozen | Build/test/security results |
| `MAP-10` | Semantic subsystem mapping | Qualification complete or qualified-with-known-blockers | Change decision ledger |
| `INT-10` | Product integration branch | Product head and accepted baseline known | Bounded branch and exact scope |
| `INT-20` | Shared-core absorption | Change decisions approved | Builds/tests and no lost downstream capabilities |
| `FORM-10` | Universal form contract | Current form inventory | Contract tests and migration plan |
| `CAP-10` | CAPTCHA decision | New upstream inspected | Adopt/port/build decision |
| `CAP-20` | CAPTCHA implementation | Provider decision | Server verification and failure tests |
| `PAY-00` | Authorize.Net intake | Shawn's payment push visible | Path/model/secret/flow report |
| `PAY-10` | Payment architecture decision | Intake reviewed | Adopt/adapt/replace record |
| `PAY-20` | Sandbox implementation | Merchant model and provider approach approved | Sandbox transaction/webhook/duplicate tests |
| `ADMIN-10` | TenantAdmin/SuperAdmin reconciliation | Auth/data contracts stable | Isolation and role matrix |
| `ONB-10` | Onboarding convergence | Capability owners mapped | Launch-gate automation |
| `TEN-10` | Existing tenant reconciliation | Platform paths proven | Per-tenant status and evidence |
| `REL-10` | Release candidate | All required matrices pass | Immutable release manifest |
| `ATLAS-10` | Atlas/package closeout | Any major phase exits | Updated Atlas, ZIP, checksums, resumption capsule |

## Major hard stops

- unpreserved local work;
- unknown active deployment branch;
- unverified Atlas overwrite;
- upstream head changes during intake;
- source/tree/hash mismatch;
- security or secret exposure;
- tenant-isolation failure;
- payment code that handles raw PAN/CVV server-side without explicit compliant design;
- unverified webhook signature handling;
- ambiguous transaction state or duplicate-charge risk;
- destructive history rewrite;
- CAPTCHA enforced without server verification and recovery behavior;
- FormEntry persistence coupled to email success;
- milestone declared complete without Atlas/package update.
