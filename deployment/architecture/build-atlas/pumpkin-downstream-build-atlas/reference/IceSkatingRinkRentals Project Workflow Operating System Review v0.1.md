# Project Workflow Operating System Review
## Evidence-Gated Building, Repeatable Chat Context, and a Reduced-Babysitting Workflow

**Project workspace:** IceSkatingRinkRentals.com  
**Observed build program:** Pumpkin CMS multi-tenant platform and tenant rollout work  
**Version:** 0.1 — analytical draft for owner review  
**Date:** July 15, 2026  
**Status:** Proposed operating doctrine and chat-bootstrap architecture; not yet ratified

---

## 1. Purpose of this report

This report reconstructs the operating system that has emerged across the recent project conversations: how the owner frames work, how the assistant/operator executes it, how both parties handle uncertainty and failure, which quality standards are repeatedly enforced, and how those behaviors can be converted into a reusable package for future chats.

The intended outcome is not merely a better prompt. It is a portable **project operating system** that gives any capable chat or coding agent enough context to:

1. understand what the project considers acceptable work;
2. know the current state without guessing;
3. recognize which actions are authorized, forbidden, or conditional;
4. execute with the same proof, safety, and closeout standards;
5. resume after interruption without re-discovery;
6. reduce repeated owner supervision without reducing owner control.

The analysis of “logic” in this report is based on observable decisions, instructions, updates, proofs, and outcomes in the retrieved conversations. It does not claim access to private hidden reasoning.

---

## 2. Scope and confidence

The visible recent materials reviewed here span approximately July 13–15, 2026 and are concentrated in the Pumpkin CMS tenant-readiness program. The strongest evidence comes from:

- V2.8.62DRU — corrected redirect deployment and tenant reconciliation;
- V2.8.62F — deterministic package-derived preview fixture;
- V2.8.62HP — strict no-mutation DNS/delegation hold;
- V2.8.62IRJ — full noindex launch, controlled deployment, publication, and form gating;
- the Build Plan and Milestones note defining the universal lead-form program.

These materials repeatedly reference and protect the state of Vegas, Party Pros, Ice, Airstrip, Pumpkin API, Admin, TenantAdmin, SuperAdmin, FormDefinition, and FormEntry. The report is therefore comprehensive for the recent conversation artifacts available in this project context, but it should not be read as a claim that every historical chat outside the retrieved set was available.

Confidence is high in the recurring workflow patterns because the same methods appear across multiple phases, systems, and failure types.

---

## 3. Executive assessment

The workflow that has emerged can be summarized as:

> **A phase-contract, evidence-gated, fail-closed building system that separates authority, implementation, mutation, proof, and closeout—and prefers reusable platform capability over tenant-specific repair.**

The collaboration works best when five conditions are present:

1. **The owner defines the operational contract.**  
   The task is framed as a bounded phase with an objective, immutable carryforward, permissions, prohibitions, hard stops, acceptance criteria, evidence requirements, and a next-phase map.

2. **The assistant turns the contract into a live state machine.**  
   It does not begin with implementation. It first proves branch, commit, staging, source state, deployment state, tenant state, credentials policy, and the existence of authoritative artifacts.

3. **Mutations are earned through proof.**  
   Read-only checks precede writes. Local tests precede packages. Clean-room packages precede deployments. Deployment completion precedes runtime proof. Runtime proof precedes the next mutation.

4. **Success means verified resulting state, not a successful command.**  
   A request, exit code, deployment acceptance, certificate request, page update, or form submission is not treated as completion until the state is read back and reconciled against the contract.

5. **The closeout becomes durable project memory.**  
   The final result is expected to include IDs, hashes, counts, modes, isolation results, no-regression results, files changed, unresolved blockers, and precise carryforward into the next phase.

This is a strong operating model. Its weakness is not the doctrine; it is that the doctrine is distributed across long prompts and repeated live explanations. The right next move is to **extract the doctrine into stable files and keep only state-changing information in the current phase packet.**

---

## 4. The two operating roles

### 4.1 The owner’s role: architect, governor, and acceptance authority

The owner consistently operates at four levels at once.

| Owner function | Observable behavior | Why it matters |
|---|---|---|
| Product architect | Defines the desired platform contract, not only the immediate patch | Prevents local success from creating global inconsistency |
| Risk governor | Specifies exact approved mutations, prohibited actions, attempt counts, and hard stops | Preserves control over irreversible or expensive actions |
| Systems integrator | Requires tenant isolation, admin behavior, persistence, notification, backup, deployment, and runtime proof to agree | Prevents one layer from being declared “done” while another remains broken |
| Acceptance authority | Defines what evidence must appear in closeout and which deviations are acceptable | Replaces subjective completion with an explicit contract |

The owner’s most important reasoning habit is **separation of concerns**. The universal lead-form model is a clear example: FormEntry persistence, admin inbox access, tenant isolation, notification recipient configuration, external email delivery, and public form mode are treated as independent dimensions. This prevents “email is not configured” from being misreported as “lead capture is broken,” and prevents “the HTTP request succeeded” from being misreported as “the lead is safely stored and manageable.”

The owner also repeatedly insists that the immediate tenant phase must not become a hiding place for unrelated platform work. A later universal identity and tenant-management program can be recorded in the next-phase map while remaining explicitly out of scope for the current Vegas phase. This is disciplined backlog capture without scope contamination.

### 4.2 The assistant’s role: operator, analyst, validator, and state reconciler

The assistant’s strongest behavior is not code generation. It is **contract-preserving execution**.

The assistant repeatedly:

- parses the phase contract before acting;
- reconstructs the exact current state;
- distinguishes read-only from mutating operations;
- uses supported interfaces instead of direct database repair;
- verifies whether an external attempt actually occurred;
- preserves attempt budgets when a local parser fails before invocation;
- avoids duplicate requests when an external system has accepted a request but readback is still pending;
- treats tool failures, transport failures, proof-harness failures, state drift, and product defects as different classes;
- reports partial state without erasing successful mutations;
- stops before the next authorized mutation when proof uncovers a real product defect;
- keeps tokens and credentials in memory and emits only safe metadata.

This is best understood as an **evidence interpreter**. The assistant’s job is not just to perform commands. It must decide what each command actually proves and what it does not prove.

### 4.3 The shared logic

The owner and assistant converge on the same central move:

> Turn uncertainty into an explicit gate, then satisfy the gate with the least destructive evidence available.

This shared logic explains the preference for readback, controlled probes, exact counts, immutable artifacts, clean rooms, hashes, one-shot budgets, no-regression matrices, and blocked closeouts.

---

## 5. Core operating principles already developed

### 5.1 State before action

Every phase begins by determining the actual state of the repository, deployment, tenant, credentials, records, routes, and prior evidence. Historical summaries are treated as carryforward to be verified, not as permission to assume.

**Rule:** No action should depend on a state fact that has not been read from an authoritative source or verified artifact.

### 5.2 Authority before capability

The fact that a tool can mutate Azure, CMS, DNS, credentials, forms, or tenant data does not authorize the mutation.

**Rule:** Every mutating action must map to an explicit approval in the current phase. Unlisted capability is not implicit permission.

### 5.3 Proof before mutation

The workflow favors non-mutating validation before write operations. Examples include redirect validation before redirect creation, local fidelity proof before deployment, deployment health before hostname binding, and no-write form preflight before a controlled persistence proof.

**Rule:** A mutation should occur only after its preconditions are proven in the same phase or are linked through immutable, verified carryforward.

### 5.4 Readback over acknowledgement

A command that returns success is only evidence that the request was accepted or executed. It is not enough to prove the resulting platform state.

**Rule:** Every mutation requires authoritative post-write readback, semantic validation, and reconciliation with expected counts and ownership.

### 5.5 One source of truth per concern

The work repeatedly separates authoritative records from derived or optional systems:

- FormEntry is authoritative; email is a secondary notification channel.
- CMS data is authoritative; a preview fixture is a deterministic rendering input, not a replacement database.
- Immutable tenant UID should be authoritative; a tenant slug can be mutable.
- Login identity should be separate from tenant contact and form-notification addresses.
- Committed result manifests and hashes are authoritative carryforward; chat recollection is not.

**Rule:** For every concern, name the authoritative record and identify every derivative representation.

### 5.6 Platform-general solutions over tenant-specific patches

The owner rejects hard-coded Vegas behavior when the capability belongs to the platform. The preview fixture compiler, tenant redirect support, host routing, form behavior, identity architecture, and notification settings are expected to work for every current and future tenant.

**Rule:** A tenant may supply data and configuration, but reusable behavior belongs in generic platform mechanisms.

### 5.7 Determinism and lineage

The workflow uses hashes, source package identity, normalized package identity, compiler version, fixture schema version, and deterministic rebuild comparisons.

**Rule:** A derived artifact must be traceable to exact inputs and reproducible from the same inputs and tool version.

### 5.8 Fail closed, but classify failure correctly

The workflow stops on security, isolation, fidelity, deployment, form, and runtime blockers. It does not, however, treat every failed check as a product defect. A broken DNS-over-HTTPS endpoint, a stale browser executable path, selector timing, a local parser error, and expected API normalization require different responses.

**Rule:** Fail closed on material risk, but classify the failure before deciding whether to repair the product, repair the proof harness, retry transport safely, or block the phase.

### 5.9 No blind retry

Attempt budgets are literal. A local parse failure that occurs before an external invocation does not consume the external budget. An accepted but pending certificate request must not be issued again merely because readback is delayed. A failed deployment cannot be repeated without renewed authority.

**Rule:** Before any retry, prove whether the external side effect occurred and whether retrying is safe, idempotent, and authorized.

### 5.10 Preserve partial truth

When the first of two writes succeeds and the second fails, the workflow does not destructively erase the successful write to manufacture an apparently clean state.

**Rule:** Preserve successful live state, document the exact partial result, and resume through an idempotent reconciliation phase.

### 5.11 Isolation and no-regression are first-class acceptance criteria

Tenant isolation is not an optional security test appended at the end. Cross-tenant denial, tenant-owned readback, SuperAdmin scope, unaffected tenants, zero Airstrip requests, and shared runtime health are part of completion.

**Rule:** A tenant change is incomplete until its own behavior, cross-tenant denial, and shared-platform no-regression are all proven.

### 5.12 Closeout is part of the product

The result package is expected to contain manifests, proof files, deployment IDs, hashes, counts, status dimensions, files changed, prohibited-action confirmations, and next-phase carryforward.

**Rule:** Work is not complete until another operator can understand and resume it from durable artifacts without reconstructing the phase from chat.

---

## 6. The canonical workflow as it exists today

The current process can be expressed as a twelve-stage operating cycle.

### Stage 1 — Intake and phase classification

The work receives:

- a phase ID and title;
- active lane and classification;
- explicit objective;
- immutable carryforward references;
- current and future program boundaries.

The phase is classified as, for example, read-only audit, local implementation, controlled deployment, targeted data mutation, hold phase, reconciliation, or closeout.

**Output:** `phase-brief` and lane classification.

### Stage 2 — Contract compilation

The owner’s intent is translated into:

- approved mutations;
- conditional mutations;
- forbidden mutations;
- attempt budgets;
- hard stops;
- expected counts and invariants;
- acceptance criteria;
- final response requirements.

**Output:** approval matrix and gate registry.

### Stage 3 — Entry-gate reconciliation

Before implementation, the assistant verifies:

- repository and branch;
- current commit and required historical commits;
- staged and unstaged state;
- authoritative artifact paths and hashes;
- tenant baseline and object counts;
- runtime/deployment baseline;
- credentials and secret-handling policy;
- external dependencies and hold conditions.

**Output:** preflight report with pass/block status.

### Stage 4 — Read-only discovery

Source, runtime routes, schemas, admin APIs, deployment configuration, historical evidence, and current live state are inspected without mutation.

**Output:** evidence-backed implementation or mutation plan.

### Stage 5 — Local implementation within an exact allowlist

Only the approved source and test files are changed. Generated output, credentials, backups, deployment ZIPs, `.tmp`, `node_modules`, `.next`, screenshots, and secret registers are excluded. Broad staging commands are prohibited.

**Output:** scoped source delta and focused tests.

### Stage 6 — Static and semantic validation

The workflow runs:

- syntax and parse checks;
- focused tests;
- type-check/build;
- schema validation;
- deterministic hash comparison where applicable;
- whitespace checks;
- secret-like scans;
- local-path and protected-config scans;
- command-shape review;
- exact staged-path comparison.

**Output:** source validation packet.

### Stage 7 — Clean-room reproduction

The exact committed source is checked out into a clean or sparse environment, dependencies are rebuilt from locks or documented toolchain rules, immutable artifacts are materialized and hash-checked, and the deployable package is rebuilt outside the dirty workspace.

**Output:** reproducible clean-room report and deployable artifact hash.

### Stage 8 — Local behavioral proof

The packaged application is run locally with production-like host and route behavior. Forms remain inert unless explicitly authorized. Redirects, routes, media, forms, age gates, noindex behavior, and tenant routing are tested before consuming external mutation budgets.

**Output:** local acceptance matrix.

### Stage 9 — Controlled external mutation

The exact authorized operation is performed with a recorded attempt number. No parallel operation or retry is introduced while the result is indeterminate.

**Output:** mutation ledger entry with command class, start/end, status, IDs, and safe log references.

### Stage 10 — Post-mutation readback and semantic proof

The resulting state is read from authoritative APIs and tested through runtime behavior. Counts, IDs, tenant ownership, state flags, redirects, publication modes, form modes, and security boundaries are reconciled.

**Output:** post-write readback and semantic proof.

### Stage 11 — Platform no-regression and isolation

Shared services and other tenants are exercised through a bounded matrix. Cross-tenant access is denied, unrelated deployments remain unchanged, Airstrip is not probed where frozen, and zero unexpected POSTs are confirmed.

**Output:** isolation and no-regression packet.

### Stage 12 — Durable closeout and carryforward

The phase receives a precise status:

- complete;
- blocked before mutation;
- blocked after partial mutation;
- deployed but live proof failed;
- held by owner decision;
- closeout incomplete.

The closeout records facts, not optimism. It updates the next-phase map without silently implementing future scope.

**Output:** result manifest, human summary, evidence index, resumption capsule, and exact commit instructions.

---

## 7. The decision logic used while solving problems

A reusable decision tree can be extracted from the conversations.

### 7.1 Before an action

1. **Is the action explicitly authorized in the current phase?**  
   If no, do not perform it.

2. **Are all immutable carryforward artifacts present and verified?**  
   If no, stop or re-establish the baseline.

3. **Is the worktree and environment safe for the action?**  
   If not, isolate the work through an exact allowlist or clean room.

4. **Can the required information be obtained read-only?**  
   If yes, prefer read-only proof.

5. **Is the action tenant-specific behavior that should be platform-general?**  
   If yes, implement a generic mechanism and supply tenant data through configuration.

6. **Does the action consume an attempt or mutation budget?**  
   If yes, record the budget before invocation and validate all preconditions first.

### 7.2 After a command or check fails

The observed workflow uses an implicit failure classifier:

| Failure class | Diagnostic question | Correct response |
|---|---|---|
| Local parser/tooling failure | Did the external command actually run? | Repair local invocation; preserve external attempt budget |
| Transport/provider failure | Did the endpoint fail, or did the target state fail? | Recheck through an equivalent authoritative path; do not mutate |
| Proof-harness defect | Is the product broken, or is the test assumption/timing/executable wrong? | Repair harness, then repeat read-only proof |
| Expected normalization | Did the supported API transform data according to known rules without semantic loss? | Document normalization and re-prove intended behavior |
| State drift | Does live state differ from the immutable baseline or expected count? | Stop and reconcile before mutation |
| Product defect | Does the behavior fail through independent reproduction? | Block the next mutation; narrow the blast radius |
| Security/isolation defect | Can a secret leak, cross-tenant read occur, or unapproved request be made? | Immediate hard stop |
| Partial mutation | Which writes succeeded, and what is the exact resulting state? | Preserve state, document it, do not destructively roll back |
| Indeterminate external request | Was the request accepted but not yet visible? | Bounded readback; no duplicate request |
| Acceptance gap | Did implementation work but required evidence remain incomplete? | Mark partial/unproven, not complete |

This classification is one of the most valuable parts of the operating model. It avoids both unsafe optimism and unnecessary rework.

---

## 8. Preferences and the project quality bar

### 8.1 Work considered acceptable

Acceptable work is:

- scoped to the current phase;
- grounded in fresh readback and verified artifacts;
- platform-generic where behavior is reusable;
- tenant-isolated;
- deterministic where derived artifacts are involved;
- idempotent or safely resumable;
- performed through supported APIs and deployment paths;
- protected by exact file allowlists and secret handling;
- proven locally before external mutation;
- followed by post-write readback;
- accompanied by no-regression evidence;
- documented in a durable closeout.

### 8.2 Work considered unacceptable

Unacceptable work includes:

- guessing current state or future phases;
- declaring success from a command exit code alone;
- broad or implicit scope expansion;
- tenant-specific hard-coding for a platform concern;
- direct Cosmos/Mongo repair when supported application paths exist;
- blind retries;
- reissuing pending external requests;
- broad staging such as `git add -A`;
- committing credentials, backups, packages, build output, or local paths;
- weakening validation to make a test pass;
- conflating notification delivery with lead persistence;
- conflating mutable contact settings with login identity;
- treating a failed proof harness as proof of a product defect;
- erasing partial success through destructive rollback;
- hiding blockers inside an optimistic summary;
- leaving the next chat to reconstruct state from conversation history.

### 8.3 Communication preferences

The owner appears to value updates that answer four questions:

1. What has been proven?
2. What remains unproven?
3. What changed—or explicitly did not change?
4. What gate controls the next action?

The assistant’s best updates are brief state transitions, not a running narration of every command. Examples of useful update structure include:

> **Proven:** branch, commit, staging, and authoritative hashes match.  
> **Unchanged:** no tenant mutation, POST, credential change, or external deployment.  
> **Next gate:** clean-room package must pass path and secret scans before the one approved deployment.

This format is more scalable than long prose because it preserves the actual decision state.

---

## 9. What the workflow does especially well

### 9.1 It protects against false completion

The workflow repeatedly prevents a shallow “green” result from becoming a false closeout. A page-update loop can finish but still trigger a content fingerprint review. An Azure request can return success but remain pending in resource readback. A form can return a response but still need FormEntry readback, idempotency proof, and tenant isolation.

### 9.2 It preserves owner control without requiring command-by-command approval

The owner controls the phase through an approval matrix and hard stops. Once the contract is clear, the assistant can execute autonomously inside it. This is the correct path to less babysitting: **pre-authorized boundaries**, not less governance.

### 9.3 It turns safety into an engineering property

Secret handling, tenant isolation, zero unapproved POSTs, zero Airstrip requests, no direct data repair, no broad staging, and immutable backups are tested and recorded, not merely stated.

### 9.4 It naturally supports multi-tenant scale

The repeated demand for generic compilers, registries, tenant-scoped routes, mutable settings, immutable IDs, and universal reconciliation creates reusable platform capability instead of a collection of tenant exceptions.

### 9.5 It is resumable in principle

Phase IDs, immutable carryforward, result manifests, hashes, attempt budgets, and partial-state handling already contain the ingredients of reliable resumption.

---

## 10. Friction, failure modes, and opportunities to improve

The current process is strong but costly. The following issues create redundant work.

### 10.1 The contract is repeated rather than referenced

Large blocks of immutable history, prohibitions, validation rules, and final-response requirements are copied into each phase. This increases context length and makes contradictions or stale copies more likely.

**Improvement:** Put stable rules in versioned policy files. A phase should reference them by version and override only what changes.

### 10.2 Current state and policy are mixed together

A prompt may combine enduring doctrine, current tenant counts, live credentials policy, one-time attempt budgets, and future backlog. This makes it harder for a new chat to know which statements are permanent and which are ephemeral.

**Improvement:** Separate:

- stable operating doctrine;
- project architecture contract;
- current state snapshot;
- current phase authorization;
- evidence index;
- next-phase backlog.

### 10.3 Resumption depends too much on conversation continuity

Context compaction and interruptions force re-reading long prompts and rediscovering exact state.

**Improvement:** Generate a `RESUMPTION-CAPSULE.md` after every material checkpoint. It should contain current commit, staged state, completed gates, live mutations, remaining budgets, current blocker, next safe action, and evidence references.

### 10.4 Proof harnesses are sometimes ad hoc

Temporary browser and DNS scripts occasionally depend on stale executable paths, timing assumptions, selectors, line endings, or transport endpoints. The assistant generally diagnoses this correctly, but the diagnosis consumes time.

**Improvement:** Maintain versioned reusable proof harnesses with:

- environment discovery;
- explicit readiness conditions;
- stable semantic selectors;
- provider fallback policy;
- safe request wrappers;
- machine-readable result schemas;
- test-harness self-checks.

### 10.5 Attempt accounting is manual

The workflow carefully reasons about whether a parser failure occurred before an Azure invocation, but this is difficult to track in prose.

**Improvement:** Introduce an append-only `attempt-ledger.jsonl` written by a wrapper that records `prepared`, `invoked`, `accepted`, `readback_confirmed`, `failed`, and `indeterminate` states.

### 10.6 Exact counts can become brittle

Counts are excellent invariants when linked to a source hash and semantic meaning. They are fragile when copied without lineage.

**Improvement:** Store each invariant with:

- source artifact and hash;
- scope;
- reason;
- comparison mode;
- allowable drift policy.

### 10.7 The closeout structure is comprehensive but repetitive

Each phase asks for many similar final sections.

**Improvement:** Define a closeout schema and generate the human report from machine-readable results.

### 10.8 Some machine-like prompt fields contain noisy or opaque names

Several retrieved contracts include malformed or opaque element names. They do not appear to affect the conceptual workflow, but they reduce readability and schema reliability.

**Improvement:** Validate phase contracts against a strict schema before execution and reject unknown fields unless explicitly allowed.

### 10.9 Updates can become too operational

Live transcripts sometimes include long command-level details. These are useful as logs but not always as owner updates.

**Improvement:** Split three channels:

- **operator log:** commands and raw technical detail;
- **decision log:** why a gate passed or blocked;
- **owner update:** concise state transition and next gate.

---

## 11. Proposed Operating Contract v1

The following doctrine should become the stable core of every future chat.

### Rule 1 — Never guess current state
Use authoritative readback or verified artifacts. Mark unknowns explicitly.

### Rule 2 — The current phase is the authority boundary
Do not implement future backlog or adjacent platform work unless the phase explicitly authorizes it.

### Rule 3 — Every mutation must be explicitly approved
Authorization must identify target, action, conditions, and attempt budget.

### Rule 4 — Read-only proof precedes mutation
Use the least destructive evidence that can satisfy the gate.

### Rule 5 — A request is not a result
Require post-write readback and semantic behavior proof.

### Rule 6 — No blind retry
First prove whether the external side effect occurred. Retry only when safe and authorized.

### Rule 7 — Preserve partial success
Do not destructively roll back a valid successful write merely to restore a cosmetically clean phase.

### Rule 8 — Use supported platform paths
Avoid direct datastore repair and tenant-specific hard-coding.

### Rule 9 — Protect shared-platform and tenant boundaries
Every tenant mutation requires isolation and no-regression proof.

### Rule 10 — Keep secrets out of source, logs, fixtures, and reports
Use memory-only handling where possible and emit only safe metadata.

### Rule 11 — Exact allowlists govern source and artifacts
No broad staging. No generated, protected, local, or private material enters commits or packages.

### Rule 12 — Closeout must be independently resumable
Record resulting state, evidence, IDs, hashes, budgets, blockers, and next safe action.

This contract should be short, stable, versioned, and included by reference rather than recopied into every phase.

---

## 12. The recommended Chat Bootstrap Package

The best package is not one enormous instruction file. It is a layered set in which stable files change rarely and dynamic files are regenerated frequently.

### 12.1 Minimal package for every new chat

| File | Stability | Purpose |
|---|---|---|
| `00-OPERATING-CONTRACT.md` | Stable | The twelve non-negotiable operating rules |
| `01-PROJECT-ARCHITECTURE.md` | Slow-changing | Systems, tenants, authoritative records, trust boundaries, environments |
| `02-CURRENT-STATE.json` | Dynamic | Verified current commits, deployments, tenants, modes, blockers, and timestamps |
| `03-CURRENT-PHASE.yaml` | Dynamic | Objective, scope, approvals, prohibitions, gates, budgets, acceptance |
| `04-EVIDENCE-INDEX.json` | Dynamic | Authoritative artifact paths, hashes, IDs, proof status, and freshness |
| `05-RESUMPTION-CAPSULE.md` | Dynamic | Last completed gate, current partial state, remaining budgets, next safe action |

These six files should be enough to start or resume most chats.

### 12.2 Extended package for implementation-heavy phases

| File | Purpose |
|---|---|
| `06-WORKTREE-POLICY.yaml` | Allowed paths, forbidden paths, staging rules, build-output rules |
| `07-SECURITY-POLICY.md` | Credential handling, redaction, secret scans, tenant-isolation rules |
| `08-VALIDATION-MATRIX.yaml` | Tests, runtime targets, invariants, no-regression and isolation probes |
| `09-UPDATE-TEMPLATE.md` | Owner-facing progress update format |
| `10-CLOSEOUT-SCHEMA.json` | Machine-readable final result structure |
| `11-NEXT-PHASE-MAP.md` | Explicit deferred work and carryforward |
| `schemas/` | JSON Schemas for state, phase, evidence, attempts, and closeout |
| `harnesses/` | Versioned reusable read-only and validation scripts |

### 12.3 What belongs outside the chat package

The package should reference, not embed:

- credentials and secret registers;
- backups;
- source ZIPs and normalized tenant packages;
- media binaries;
- deployment ZIPs;
- screenshots and browser profiles;
- raw customer data;
- FormEntries;
- local machine paths that are not portable.

The evidence index should carry safe paths or logical identifiers plus hashes, not private content.

---

## 13. Proposed machine-readable phase schema

A future `03-CURRENT-PHASE.yaml` should look conceptually like this:

```yaml
schemaVersion: 1
project: IceSkatingRinkRentals.com
platform: Pumpkin
phase:
  id: V2.8.XX
  title: Descriptive phase title
  lane: platform-or-tenant-lane
  classification: machine_readable_classification
  objective: >
    One precise description of the resulting state this phase is allowed to create.

scope:
  in:
    - exact capability or tenant object
  out:
    - explicitly deferred capability
  immutableCarryforward:
    - artifactId: prior-result-manifest
      sha256: "<expected hash>"

authority:
  approvedMutations:
    - id: deploy-starter
      target: app-pumpkin-starter
      conditions:
        - local-proof-passed
        - package-scan-passed
      maxAttempts: 1
  conditionalMutations:
    - id: create-two-redirects
      condition: both-live-validations-pass
  forbidden:
    - direct-database-repair
    - credential-rotation
    - unapproved-form-post
    - git-add-all

entryGates:
  - id: correct-branch
  - id: required-commits-present
  - id: staging-empty
  - id: authoritative-hashes-match
  - id: live-baseline-matches

hardStops:
  - id: secret-detected
  - id: tenant-isolation-failed
  - id: expected-count-drift
  - id: unapproved-request-detected
  - id: product-defect-before-next-mutation

attemptBudgets:
  deploy-starter:
    approved: 1
    invoked: 0
    confirmed: 0

acceptance:
  - id: resulting-state-readback
  - id: semantic-runtime-proof
  - id: cross-tenant-denial
  - id: shared-no-regression
  - id: durable-closeout-complete

closeout:
  requiredStatusDimensions:
    - implementation
    - deployment
    - persistence
    - adminAccess
    - tenantIsolation
    - externalNotification
    - publicMode
  requiredArtifacts:
    - result-manifest.json
    - current-state-summary.md
    - validation-result.json
    - resumption-capsule.md
```

The schema turns the owner’s existing style into a validated contract rather than weakening it.

---

## 14. Proposed current-state schema

`02-CURRENT-STATE.json` should be a fact snapshot, not a plan:

```json
{
  "schemaVersion": 1,
  "generatedAtUtc": "2026-07-15T00:00:00Z",
  "freshnessPolicy": {
    "repositoryMinutes": 15,
    "deploymentMinutes": 30,
    "tenantReadbackMinutes": 30,
    "dnsMinutes": 30
  },
  "repository": {
    "branch": "feature/...",
    "head": "<commit>",
    "stagedCount": 0,
    "dirtyPaths": []
  },
  "platform": {
    "apiDeploymentId": "<id>",
    "starterDeploymentId": "<id>",
    "adminDeploymentId": "<id>"
  },
  "tenants": {
    "vegas": {
      "tenantUid": "<immutable uid or unknown>",
      "tenantSlug": "strip-club-near-me-vegas",
      "publicMode": "noindex",
      "formMode": "no-post",
      "leadPersistence": "blocked",
      "adminInbox": "unknown",
      "tenantIsolation": "proven",
      "lastReadbackEvidence": "evidence://..."
    }
  },
  "blockers": [
    {
      "id": "hydration-crash",
      "scope": "vegas:/guides/best-strip-clubs-las-vegas",
      "classification": "product-defect",
      "nextSafeAction": "local source repair and reproof; no form activation"
    }
  ]
}
```

Unknown must be a valid value. It is better than an inferred false or optimistic true.

---

## 15. Evidence index and invariant registry

The evidence index should make every important assertion traceable.

```json
{
  "evidence": [
    {
      "id": "vegas-backup-manifest",
      "type": "immutable-artifact",
      "logicalPath": "secure-handoff://tenant-backups/vegas/v2-8-62e",
      "sha256": "<hash>",
      "proves": [
        "backup-exists",
        "database-export-count",
        "media-count"
      ],
      "verifiedAtUtc": "2026-07-15T00:00:00Z"
    },
    {
      "id": "runtime-no-regression-85",
      "type": "runtime-proof",
      "resultPath": "evidence://runtime/no-regression-85.json",
      "status": "passed",
      "targets": 85,
      "unexpectedPosts": 0,
      "airstripRequests": 0
    }
  ],
  "invariants": [
    {
      "id": "vegas-route-count",
      "expected": 43,
      "comparison": "exact",
      "sourceEvidenceId": "vegas-normalized-package",
      "sourceHash": "<hash>",
      "reason": "all source routes must remain represented"
    }
  ]
}
```

This removes the need to paste every count and hash into every prompt.

---

## 16. Attempt ledger

A machine-readable attempt ledger is essential for preserving the project’s “no blind retry” rule.

```json
{
  "operationId": "starter-deploy-v2-8-xx",
  "budget": 1,
  "events": [
    {
      "state": "prepared",
      "atUtc": "..."
    },
    {
      "state": "local_parser_failed",
      "atUtc": "...",
      "externalInvocationOccurred": false
    },
    {
      "state": "invoked",
      "attempt": 1,
      "atUtc": "..."
    },
    {
      "state": "accepted",
      "externalId": "<deployment id>",
      "atUtc": "..."
    },
    {
      "state": "readback_confirmed",
      "atUtc": "..."
    }
  ],
  "remainingBudget": 0
}
```

This formalizes a reasoning behavior that the assistant already applies manually.

---

## 17. Owner-update protocol

Future chats should use one concise update format.

```text
PHASE: V2.8.XX — <title>
STATUS: in_progress | blocked | complete | partial

PROVEN
- Exact facts established since the prior update.

UNCHANGED / SAFETY
- Mutations that did not occur.
- Attempt budgets still remaining.
- Secrets and protected systems not touched.

ISSUE
- Only when a material blocker or reclassification occurred.
- Classify as tooling, transport, harness, drift, product, security, or partial mutation.

NEXT GATE
- The single proof that controls the next authorized action.
```

Updates should occur at state transitions:

- entry gates complete;
- implementation scope becomes concrete;
- local proof passes or blocks;
- external attempt begins;
- external readback becomes definitive;
- a blocker changes the phase;
- closeout is complete.

Command-level narration belongs in logs unless it materially changes the decision state.

---

## 18. Closeout protocol

Every closeout should use the same top-level structure.

### 18.1 Required human summary

1. Phase status, lane, and classification  
2. Objective and authorized scope  
3. Immutable carryforward verified  
4. Source and commit result  
5. Package and deployment result  
6. Mutations performed, with exact counts  
7. Authoritative readback  
8. Runtime behavior  
9. Tenant isolation and no-regression  
10. Security and prohibited-action confirmations  
11. Deviations, blockers, and partial state  
12. Files and durable artifacts  
13. Remaining attempt budgets  
14. Next safe action and next-phase map

### 18.2 Required status dimensions

A single `complete/failed` flag is too coarse. The lead-form program already demonstrates the preferred pattern:

```text
sourceImplementation:
working | blocked | not_in_scope

deployment:
working | blocked | not_attempted

leadPersistence:
working | blocked | unproven | not_in_scope

adminInbox:
working | blocked | unproven | not_in_scope

tenantIsolation:
working | blocked | unproven

notificationRecipientConfigured:
true | false | not_applicable

externalEmailDelivery:
implemented_and_proven
implemented_but_unproven
not_implemented
failed
not_in_scope

publicFormMode:
live | no-post | held

closeoutEvidence:
complete | incomplete
```

This prevents one dependency from obscuring the state of the rest of the system.

---

## 19. Automation opportunities

The operating system can be made substantially lighter through a small set of tools.

### 19.1 Phase compiler

Input: owner-authored YAML.  
Output: validated phase contract, approval matrix, hard-stop list, and closeout checklist.

### 19.2 Preflight runner

Reads the phase contract and automatically checks branch, commits, staging, hashes, expected artifacts, live baseline, and attempt ledger.

### 19.3 Mutation wrapper

Requires an approved operation ID, verifies gates, records invocation, captures safe IDs, performs bounded readback, and updates the ledger.

### 19.4 Proof harness registry

Reusable browser, runtime, DNS, tenant-isolation, form, and no-regression harnesses with stable result schemas.

### 19.5 Closeout generator

Combines source delta, attempt ledger, proof results, state readback, and artifact hashes into both `result-manifest.json` and a human report.

### 19.6 Resumption capsule generator

Runs at every checkpoint and records exactly what a new chat needs to continue safely.

### 19.7 Context pack builder

Produces a small uploadable ZIP containing only the six minimal bootstrap files plus referenced schemas. It should reject secrets and large/private artifacts automatically.

---

## 20. Recommended implementation sequence

### Step A — Ratify the doctrine

Agree on the twelve operating rules and the failure classifier. This is the most important decision because every later file and tool derives from it.

### Step B — Build the six-file minimal package

Create:

1. operating contract;
2. architecture summary;
3. current state;
4. current phase;
5. evidence index;
6. resumption capsule.

### Step C — Back-test against a completed phase

Use V2.8.62DRU or V2.8.62F as a reference. Reconstruct the phase using only the package and determine whether a fresh chat would know:

- what it may mutate;
- what it must not mutate;
- which evidence is authoritative;
- what counts as completion;
- how to handle partial failure.

### Step D — Use the package on the next live phase

Measure:

- number of owner corrections;
- number of repeated questions;
- context size;
- time spent rediscovering state;
- number of unsafe or out-of-scope attempts;
- closeout completeness.

### Step E — Convert repeated manual checks into tools

Automate only after the schemas and doctrine prove stable. Automating an unstable contract would preserve the wrong behavior.

---

## 21. Proposed agreement standard

The workflow can be considered “nailed down” when both parties agree on these statements:

1. The phase contract, not chat momentum, defines authority.
2. Current state must be verified, not remembered.
3. Read-only proof precedes mutation.
4. Every mutation has an explicit target, condition, and attempt budget.
5. Successful requests require resulting-state readback.
6. No blind retry is permitted.
7. Partial successful state is preserved and documented.
8. Shared-platform behavior must be generic and tenant-isolated.
9. Secrets and private artifacts never enter the context package.
10. The closeout must be sufficient for independent resumption.
11. Stable doctrine is referenced by version; it is not recopied into every phase.
12. Unknown and unproven are valid statuses and must not be converted into false certainty.

---

## 22. Final conclusion

The project has already developed a sophisticated workflow. Its distinguishing strengths are not merely caution or detail. They are:

- explicit authority boundaries;
- evidence-based state management;
- precise separation of system concerns;
- deterministic artifact lineage;
- supported-path changes;
- tenant isolation;
- no-regression proof;
- attempt accounting;
- safe partial-state handling;
- durable closeout.

The reduced-babysitting solution is therefore not to give a future chat more prose. It is to give it **better-structured authority and state**.

The ideal package has:

- a short stable doctrine;
- a current-state snapshot;
- a current-phase authorization contract;
- a traceable evidence index;
- an append-only attempt ledger;
- a resumption capsule.

With that structure, the owner can remain the architect and acceptance authority without repeatedly restating the same safety rules, while the assistant can operate with greater autonomy without guessing, expanding scope, or weakening proof.

The next project artifact should be **Operating Contract v1 plus the six-file bootstrap package schema**, back-tested against one completed Pumpkin phase before it is used as the default context package.
