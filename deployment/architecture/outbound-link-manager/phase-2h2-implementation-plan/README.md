# Phase 2H-2 Outbound Link Manager Implementation Plan

Status: complete

Phase 2H-2 converts the Phase 2H-1 Outbound Link Manager architecture into an exact implementation plan and architecture QA gap audit.

This is planning only. It does not implement scanner code, create schemas in a runtime database, migrate data, write CMS records, crawl external links, call CMS/API endpoints, mutate Azure, deploy, index, or publish live pages.

Recommended first implementation target:

`deployment/architecture/outbound-link-manager/local-implementation/`

The first implementation batch should be local/offline only: fixture content in, registry/instance scan reports out under ignored local output. Live-readonly and write-capable behavior stay behind future approval gates.

## Contents

- `IMPLEMENTATION_SCOPE.md`
- `PHASE_2H1_ARCHITECTURE_QA.md`
- `GAP_REGISTER.md`
- `PROPOSED_PACKAGE_LOCATIONS.md`
- `MODULE_BOUNDARIES.md`
- `DATA_MODEL_IMPLEMENTATION_PLAN.md`
- `LOCAL_SCANNER_IMPLEMENTATION_PLAN.md`
- `REGISTRY_SERVICE_IMPLEMENTATION_PLAN.md`
- `TEST_FIXTURE_PLAN.md`
- `ACCEPTANCE_CRITERIA.md`
- `IMPLEMENTATION_BATCHES.md`
- `RISKS_AND_OPEN_DECISIONS.md`
- `NEXT_PHASE_2H3_LOCAL_SCANNER_REGISTRY_FOUNDATION_PROMPT.md`
- `manifest.json`
