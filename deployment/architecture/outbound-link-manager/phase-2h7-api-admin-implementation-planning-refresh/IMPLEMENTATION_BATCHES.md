# Implementation Batches

## Phase 2H-8 API Contract And Local Service Foundation

Implement shared API contract models, service interfaces, local/fake provider, validators, and tests. No live DB migration and no Admin UI.

Acceptance:

- local/fake service reads fixture stores
- filters and pagination work in service tests
- no live provider calls
- no write-capable production persistence

## Phase 2H-9 API Readonly Endpoint Foundation

Implement GET endpoints using local/fake provider, auth gates, tenant scoping, request validation, and API tests.

Acceptance:

- read-only endpoints return typed models
- tenant leakage tests pass
- write endpoints remain unimplemented or hard-stopped

## Phase 2H-10 Admin Readonly UI Foundation

Implement dashboard, list, detail, instances, policies, scan runs, audit, and export status views using local/fake or read-only API mode.

Acceptance:

- write controls disabled
- filters and navigation work
- no production renderer integration

## Phase 2H-11 Write Action Preflight And Approval Gates

Plan and preflight status changes, policy updates, bulk actions, and scan-run writes.

Acceptance:

- preview output exists
- conflict and ETag handling is proven
- writes still require explicit approval

## Phase 2H-12 Ice Readonly Outbound Link Inventory Preflight

Run an approved read-only inventory path for Ice content if safe access exists.

Acceptance:

- read-only evidence package
- no CMS writes
- no external link crawling
- no live-page publication

