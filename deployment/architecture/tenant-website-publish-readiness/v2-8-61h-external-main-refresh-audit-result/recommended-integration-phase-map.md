# Recommended Integration Phase Map

## Phase 1: Owner Decision

Decide whether to resume Airstrip custom-domain cutover immediately on the current proven runtime or keep cutover paused for upstream integration first.

Recommended default: resume cutover separately if business priority is the Airstrip domain, because upstream integration is not required for current default-host readiness.

## Phase 2: Contract-Only Upstream Integration Plan

Scope:

- route table diff;
- DTO/model diff;
- container/readback assumptions;
- role/auth matrix;
- Admin UI client route map;
- package/starter template evaluation.

No source implementation or production writes.

## Phase 3: API And Model Adaptation

Scope:

- preserve active public/admin aliases;
- reconcile FormDefinition/FormEntry fields;
- add contract tests;
- validate local and isolated runtime;
- no customer-facing POST until approved.

## Phase 4: Admin UI Adaptation

Scope:

- selectively port form designer improvements;
- selectively port users/theme controls;
- preserve standalone Admin UI App Service;
- keep embedded starter `/admin` out of production unless separately approved.

## Phase 5: Starter Template Lane

Scope:

- evaluate `apps/starter-app` as future tenant starter;
- define template export/import contract;
- prove isolated starter deployment;
- only then consider production tenant use.

## Phase 6: Public Form Proof

Scope:

- explicit customer-facing form POST approval;
- synthetic non-PII form submission;
- authenticated Admin readback;
- no retry after sent POST unless separately approved.
