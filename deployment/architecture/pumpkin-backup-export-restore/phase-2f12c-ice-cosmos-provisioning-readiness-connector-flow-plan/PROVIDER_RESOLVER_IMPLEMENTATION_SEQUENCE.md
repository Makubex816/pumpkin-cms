# Provider Resolver Implementation Sequence

## Batch 1: Contracts And Fixtures

- Add resolver schema and fixture data.
- Support configured Cosmos, missing source with Cosmos target, invisible scope, mismatch, local provider, and unsupported provider.
- Add forbidden-field validation.

## Batch 2: Local Resolver

- Implement fixture and local-dev resolver modes.
- Emit JSON and Markdown reports.
- Fail closed when profile or tenant/site scope is missing.

## Batch 3: Backup Center Integration

- Feed resolver output into standard backup readiness reports.
- Add source-map fields to tenant website bundles.
- Make production-restore-proof validation fail when provider status is `missing`, `blocked`, or `planned`.

## Batch 4: Owner Scope Inputs

- Add a non-secret owner scope contract.
- Compare expected provider/resource names with resolver evidence.
- Record mismatch and invisible-scope blockers.

## Batch 5: Live Read-Only Hooks

- Add approved read-only provider verification hooks only after future approval.
- No export, provisioning, or config writes in resolver execution.

## Acceptance Criteria

- Resolver can prove why live connector execution is allowed or blocked.
- Missing database plus owner Cosmos target does not appear as configured.
- Reports never include secrets or protected config values.
