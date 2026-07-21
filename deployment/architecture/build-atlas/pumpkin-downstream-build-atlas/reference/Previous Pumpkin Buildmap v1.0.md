# Full-Scope Build Map

## 1. Program statement

The program will absorb the partner’s newest Pumpkin CMS work without losing provenance, establish an immutable upstream baseline, make the IceSkatingRinkRentals product line a clean descendant of that baseline, and add a universal human-verification layer to the form platform.

The target operating chain is:

```text
Partner push to SDI-AI/main
→ read-only intake
→ exact commit frozen
→ clean-room qualification
→ fork mirror synchronized
→ product branch created from frozen commit
→ our changes replayed or reconciled as scoped commits
→ CAPTCHA/form-security foundation added generically
→ tenant-by-tenant reconciliation
→ controlled staging and production rollout
→ durable closeout and next upstream intake
```

## 2. Central architecture decision

Use separate branch roles:

```text
SDI-AI/pumpkin-cms
└── main                              moving partner-owned upstream

Makubex816/pumpkin-cms
├── main                              fast-forward mirror of upstream/main
├── immutable/upstream/<date>-<sha>   protected exact snapshot
├── product/ice-rink/main             long-lived integrated product line
├── integration/<phase>-<slug>        short-lived implementation branches
└── release/ice-rink/<version>        qualified release candidates

Protected tags
├── upstream-snapshot/<date>-<sha>
└── upstream-qualified/<date>-<sha>
```

`main` remains easy to compare with upstream and contains no IceSkatingRinkRentals-only work. Our product work lives on `product/ice-rink/main`. This avoids repeatedly untangling a moving vendor branch from product customizations.

If an existing deployment currently builds from the fork’s `main`, that deployment source must be moved through a separately approved infrastructure phase. Do not silently change deployment branches during repository synchronization.

## 3. Current verified/provisional state

At the time this package was prepared:

- SDI-AI `main` was observed at `785e079269276c177832f9e7186ae44675e76f52`.
- Makubex816 `main` was observed at `64156a3015943f08bc89cadb2caae910d5cadf4f`.
- GitHub’s comparison reported the fork as zero commits ahead and 54 commits behind, with `64156a3015943f08bc89cadb2caae910d5cadf4f` as the merge base.
- The partner then confirmed that additional work had not yet been pushed.
- Therefore the final upstream baseline is unknown and the freeze phase is blocked on an external dependency.

Unpushed local branches, commits, staged changes, unstaged changes, and untracked files are not visible through GitHub and must be inventoried before any synchronization.

## 4. Scope boundaries

### Included

- live read-only GitHub intake after partner confirmation;
- exact commit and tree provenance;
- local-work preservation;
- immutable tag and branch creation;
- ruleset requirements;
- offline bundle/archive;
- clean-room .NET and Node qualification;
- package and dependency reconciliation;
- product branch inheritance;
- upstream-to-product delta management;
- universal form-contract reconciliation;
- provider-neutral CAPTCHA architecture;
- Turnstile-first implementation path;
- idempotency and correlation IDs;
- distributed rate limiting;
- tenant-scoped admin inbox and export;
- optional notification delivery separated from persistence;
- current-tenant reconciliation;
- onboarding gates for future tenants;
- staging and production rollout;
- closeout, evidence, and resumption.

### Excluded unless separately authorized

- force-pushing any branch;
- rewriting published product history;
- deleting local or remote branches;
- changing production deployment sources;
- rotating tenant API keys or user credentials;
- changing DNS, certificates, domains, or Azure resources;
- creating CAPTCHA provider accounts or billing arrangements;
- inserting real provider secrets into source or chat artifacts;
- sending production form submissions;
- changing existing tenant data before a no-write reconciliation;
- direct Cosmos repair when supported Pumpkin routes exist.

## 5. Workstreams

### Workstream A — Upstream intake and immutable provenance

Purpose: capture the exact partner-delivered source before product modifications.

Deliverables:

- final upstream commit SHA;
- final tree SHA;
- commit metadata and signature status;
- comparison against previous upstream and fork heads;
- changed-file inventory by subsystem;
- protected immutable branch;
- protected annotated or signed tag;
- baseline manifest;
- source archive or Git bundle hash;
- evidence index update.

### Workstream B — Upstream qualification

Purpose: distinguish “exactly frozen” from “qualified for integration.”

Qualification includes:

- clean checkout from the frozen SHA;
- toolchain inventory;
- package restore;
- .NET restore/build/test;
- TypeScript model build;
- block-view build;
- starter-app lint/type-check/build;
- generated artifact and lockfile review;
- secret and local-path scans;
- API/form contract tests;
- no uncommitted dependency on local state.

The incoming snapshot remains immutable even if qualification fails. A failure changes only the baseline status, never the source.

### Workstream C — Fork and product topology

Purpose: keep the fork’s `main` comparable to upstream while preserving a dedicated product line.

Rules:

- fork `main` is fast-forward-only from upstream;
- product code does not land directly on fork `main`;
- immutable refs are never reused or moved;
- product branch changes arrive through PRs and required checks;
- released product history is not rebased;
- new upstream snapshots enter product history through an explicit integration PR.

### Workstream D — Upstream impact absorption

Purpose: understand, not merely compile, the partner’s latest push.

Required subsystem review:

- .NET and Node toolchains;
- tenant and credential models;
- API authentication and authorization;
- database interfaces and Cosmos behavior;
- FormDefinition and FormEntry;
- public form submission route;
- starter-app rendering and cache behavior;
- TenantAdmin UI;
- SuperAdmin/operator boundary;
- media;
- themes;
- navigation and page map;
- hub/spoke content;
- package models and shared block views;
- deployment and environment assumptions;
- tests and CI.

Each upstream change receives one disposition:

```text
adopt_as_is
adopt_with_product_configuration
port_to_product_counterpart
supersede_with_generic_platform_solution
defer_with_explicit_reason
block_due_to_contract_conflict
```

### Workstream E — Universal form platform

Purpose: preserve FormEntry as the authoritative lead record.

Required state dimensions remain independent:

```text
leadPersistence
adminInbox
tenantIsolation
notificationRecipientConfigured
externalEmailDelivery
publicFormMode
humanVerification
idempotency
rateLimiting
```

Email delivery remains secondary and cannot determine whether the lead exists.

### Workstream F — CAPTCHA and abuse prevention

Purpose: add defense in depth without creating a tenant-specific widget patch.

Defense layers:

1. schema and payload-size validation;
2. system-rendered honeypot;
3. consent enforcement where required;
4. trusted client-context handling;
5. pre-verification abuse throttling;
6. provider challenge;
7. action and hostname validation;
8. idempotency;
9. durable post-verification rate limiting;
10. observability and tenant isolation.

The initial provider recommendation is Cloudflare Turnstile behind a provider-neutral interface. The form and API contracts must not hard-code Cloudflare response names as permanent domain fields.

## 6. Phase map

### Phase UP-00 — External dependency hold

**Objective:** preserve a no-mutation state until the partner confirms the push.

Approved:

- current repository analysis;
- package creation;
- local planning;
- read-only checks.

Forbidden:

- final baseline labeling;
- branch/tag creation for the provisional SHA;
- fork reset or fast-forward;
- product integration based on assumed partner completion.

Exit gate:

- explicit partner confirmation that the push is complete.

### Phase UP-10 — Final upstream intake

**Objective:** identify the exact new upstream head and the delta since `785e07926927`.

Gates:

1. fetch succeeds from both repositories;
2. upstream URL and default branch are exact;
3. new upstream SHA is recorded;
4. commit object, parents, and tree resolve;
5. changed-file inventory is generated;
6. current fork relation is calculated;
7. no write is performed.

Hard stops:

- upstream head changes during intake;
- repository identity mismatch;
- shallow or incomplete history;
- ambiguous fork ancestry;
- missing objects;
- unexpected rewrite of previously observed history.

Exit artifact:

- `upstream-intake-report.json`.

### Phase UP-20 — Preserve all product/local work

**Objective:** prove nothing will be lost before synchronization.

Required inventory:

- all local branches;
- all worktrees;
- all commits not reachable from either remote;
- staged changes;
- unstaged changes;
- untracked files;
- submodules, if any;
- ignored private files by location only;
- deployment artifacts by location only.

Required backups:

- `git bundle` containing all refs;
- branch/ref listing;
- tracked staged and unstaged patches in a protected local folder;
- manual secure handling of untracked/private files;
- checksums.

Hard stops:

- bundle verification fails;
- local commit is not represented in the bundle;
- secret-bearing patch would be uploaded or committed;
- operator cannot explain an unmerged branch.

### Phase UP-30 — Freeze exact incoming snapshot

**Objective:** create durable references to the exact partner commit.

Create:

```text
immutable/upstream/YYYYMMDD-<sha12>
upstream-snapshot/YYYYMMDD-<sha12>
```

Record:

- upstream repository;
- full commit SHA;
- tree SHA;
- parent SHAs;
- author/committer times;
- commit verification state;
- previous snapshot;
- archive/bundle SHA-256;
- created-by identity;
- reason and intake report hash.

Ruleset:

- restrict updates;
- restrict deletions;
- block force pushes;
- no general bypass;
- branch and tag patterns target only immutable refs.

No product fix may be committed to this branch.

### Phase UP-40 — Clean-room qualification

**Objective:** qualify the frozen source without modifying it.

Minimum command families:

```text
dotnet --info
node --version
npm --version
dotnet restore/build
API test runner
npm install/ci according to the approved lock strategy
TypeScript model build
block-view build
starter-app lint
starter-app type-check
starter-app production build
secret/local-path/generated-output scans
```

Because the provisional upstream currently has no attached GitHub Actions status and its root lockfile does not describe the nested Node dependency graph, qualification must explicitly establish the final pushed state’s reproducibility model before promotion.

Outputs:

- toolchain manifest;
- dependency manifest;
- test results;
- build logs;
- artifact hashes;
- qualification status.

### Phase UP-50 — Synchronize fork mirror

Entry conditions:

- final upstream snapshot exists;
- local work is preserved;
- ancestry permits fast-forward or an owner-approved alternative;
- fork `main` contains no product-only commits.

Preferred first synchronization:

```text
upstream/main
→ fast-forward
→ origin/main
```

Forbidden:

- `reset --hard` without completed preservation;
- force-push;
- merging product commits into mirror `main`;
- changing default branch or deployment source implicitly.

### Phase IN-10 — Establish product branch

Create:

```text
product/ice-rink/main
```

Base:

- the qualified immutable upstream SHA, or
- the exact immutable snapshot with qualification failures explicitly carried as blockers.

The first product commit should add only repository operating-system files and CI/qualification scaffolding unless another allowlist is explicitly approved.

### Phase IN-20 — Reconcile existing IceSkatingRinkRentals work

Classify every local/product delta:

```text
already_upstream
still_required
superseded_by_upstream
conflicts_with_upstream_contract
tenant_data_only
deployment_only
private_operator_only
obsolete
```

Replay or port only `still_required` work. Prefer small semantic commits over a bulk tree copy.

Required proof:

- exact file allowlist;
- behavior comparison;
- no loss of upstream hardening;
- no resurrection of removed public operator-admin code;
- clean-room build after replay.

### Phase FS-10 — Canonical form-contract reconciliation

Before CAPTCHA, normalize the form platform:

- inventory all live form blocks and types;
- inventory all FormDefinitions and active states;
- map canonical IDs and types;
- identify aliases such as `contact` versus `contact_submission`;
- prove one active definition per intended form type;
- ensure the client always renders system honeypot and consent controls;
- define typed submission envelope;
- define exact-one persistence and idempotency behavior;
- preserve backward compatibility behind an adapter.

No live definition mutation occurs during the inventory phase.

### Phase HC-10 — Human-verification domain model

Add provider-neutral concepts:

```text
FormChallengeSettings
PublicChallengeConfig
HumanChallengeResponse
HumanVerificationResult
HumanVerificationOutcome
IHumanVerificationService
ICaptchaCredentialResolver
```

Suggested states:

```text
provider:
none | turnstile | recaptcha | hcaptcha

enforcementMode:
disabled | observe | enforce

outcome:
not_required | passed | failed | unavailable | configuration_error
```

Secrets are referenced, never embedded in FormDefinition or returned publicly.

### Phase HC-20 — Client challenge component

Add a generic `ChallengeWidget` to the shared starter form renderer.

Requirements:

- dynamic/explicit rendering for React forms;
- provider loaded only when enabled;
- public site key only;
- token retained only in memory/hidden request field;
- token reset after use, expiry, failure, or form reset;
- accessible status and retry;
- CSP support;
- no provider secret in `NEXT_PUBLIC_*`;
- test-key support outside production;
- system honeypot rendered independently of CAPTCHA.

### Phase HC-30 — Canonical server verification

Validate in Pumpkin API, not only in the starter proxy, so direct API clients cannot bypass the challenge.

Verification steps:

1. resolve active FormDefinition;
2. reject missing configuration when enforcement is active;
3. apply cheap input and abuse checks;
4. resolve secret from secure store;
5. call provider Siteverify endpoint;
6. verify success;
7. verify expected action;
8. verify allowed hostname;
9. validate token age where available;
10. map provider errors to stable internal codes;
11. discard the raw token;
12. continue to idempotent persistence only on pass.

No raw challenge token is logged or stored.

### Phase FS-20 — Submission idempotency and correlation

Introduce:

- client-generated `submissionId`;
- HTTP `Idempotency-Key`;
- request `correlationId`;
- deterministic tenant-partitioned FormEntry ID or unique-key behavior;
- duplicate readback returning the original FormEntry ID;
- safe retry semantics;
- proxy propagation of correlation IDs.

A provider token is single-use. A retry after uncertain persistence must reuse the submission idempotency key but obtain a new challenge token if the prior token was spent.

### Phase FS-30 — Distributed abuse controls

Replace or supplement in-process rate limiting with a shared mechanism suitable for multiple API instances.

Separate:

- high-threshold pre-verification attempt protection;
- challenge failure metrics;
- lower-threshold accepted-submission limits;
- tenant/form/client dimensions;
- trusted proxy/client fingerprint logic.

Do not let all users behind a Next.js proxy collapse into one rate-limit identity.

### Phase AD-10 — TenantAdmin inbox and SuperAdmin scope

TenantAdmin must be able to:

- list;
- filter;
- open;
- update status;
- export;
- view verification and delivery state;
- access only its tenant.

SuperAdmin must be able to operate across tenants through the private operator surface.

Cross-tenant access to the same FormEntry ID must fail.

### Phase NT-10 — Notification service

After persistence:

```text
FormEntry stored
→ notification job created
→ provider attempt
→ delivery result stored separately
```

Missing configuration or delivery failure must not remove or roll back the FormEntry.

### Phase TN-10 — Existing tenant reconciliation

For Ice, Party Pros, Airstrip, and Vegas:

- map every form block;
- verify definition;
- verify site hostname and public challenge config;
- verify no-write preflight;
- perform exactly one controlled persistence proof when authorized;
- read back the same FormEntry;
- prove TenantAdmin access;
- prove cross-tenant denial;
- record external notification state separately;
- set `publicFormMode`.

### Phase RL-10 — Staged rollout

Order:

```text
local test keys
→ clean-room integration
→ non-production provider credentials
→ staging observe mode
→ staging enforce mode
→ one low-risk production tenant
→ remaining tenants
→ onboarding default
```

No global enforcement switch before tenant credential and hostname readiness is proven.

### Phase OP-10 — Recurring upstream intake

For each later partner push:

1. freeze a new snapshot;
2. qualify it;
3. create `integration/upstream-<date>`;
4. merge the new immutable baseline into current product main;
5. resolve semantically;
6. run the full no-regression matrix;
7. merge by PR;
8. never move old immutable refs.

## 7. Required CI gates

Product PRs must include:

- .NET restore/build;
- API contract tests;
- TypeScript model build;
- block-view build;
- starter-app lint/type-check/build;
- form model parity tests;
- challenge verifier unit tests;
- provider adapter contract tests with official test credentials;
- idempotency tests;
- tenant-isolation tests;
- no-secret scan;
- generated-output policy;
- exact lockfile check;
- package manifest validation.

## 8. Definition of done

This program is complete only when:

- the final partner push is captured by exact SHA;
- immutable refs cannot be updated or deleted by normal contributors;
- the source can be reconstructed from an independently hashed archive or bundle;
- fork `main` is a clean upstream mirror;
- product branch descends from the immutable baseline;
- every retained product change has an explicit disposition;
- clean-room builds pass;
- CAPTCHA is provider-neutral and server-validated;
- tokens are single-use and never persisted;
- action and hostname checks are enforced;
- idempotency creates exactly one FormEntry;
- distributed rate limits do not collapse all proxy users together;
- TenantAdmin inbox and cross-tenant denial pass;
- notification status is independent of persistence;
- all existing tenants have independent status values;
- a new chat can resume from the package without reconstructing history.

## 9. Immediate next gate

No further repository mutation is appropriate until:

```text
partner confirms push
→ final upstream head is observed
→ current package state is refreshed
→ read-only intake passes
```
