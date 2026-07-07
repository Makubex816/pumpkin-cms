# Prechange Preservation Ledger

Status: created before V2.8.61I source changes.

## Guard State

- Active branch: `feature/admin-page-editor-import-export`.
- Staged files at start: none.
- V2.8.61H report commit present: `ebef6ac4 Add V2.8.61H external main refresh audit`.
- SDI-AI upstream clone pin: `565a8afd669a42224a9d15759f7060faa375d000`.
- Makubex owner clone pin: `64156a3015943f08bc89cadb2caae910d5cadf4f`.
- Airstrip hard freeze: active. No Airstrip probes, source edits, deployment, DNS, DomainBinding, media, CMS writes, or form submissions are part of this phase.

## Protected Downstream Systems To Preserve

These source/document surfaces must remain present after controlled integration:

- `apps/pumpkin-api/Services/DomainBindings/`
- `apps/admin/src/app/dashboard/onboarding/domains/`
- `apps/admin/src/lib/api.ts` DomainBinding client methods
- `apps/pumpkin-api/Services/ImportIntake/`
- `apps/pumpkin-api/Services/ImportExecutions/`
- `apps/pumpkin-api/Services/OperatorHandoffs/`
- `apps/pumpkin-api/Services/OutboundLinks/`
- `apps/admin/src/app/dashboard/forms/`
- `apps/admin/src/app/dashboard/form-builder/`
- `apps/admin/src/app/dashboard/onboarding/`
- `apps/admin/src/app/dashboard/onboarding/backups/`
- `apps/admin/src/app/dashboard/onboarding/packages/`
- `apps/admin/src/app/dashboard/import-executions/`
- `apps/admin/src/app/dashboard/operator-handoffs/`
- `apps/pumpkin-api/Program.cs` external compatibility aliases
- `apps/pumpkin-api/Services/FormSubmissionGuard.cs`
- `apps/pumpkin-api.Tests/DomainBindingSourceTestRunner.cs`
- `apps/pumpkin-api.Tests/UserProfileManagementSourceTestRunner.cs`
- `apps/pumpkin-api.Tests/FormDefinitionApiSourceTestRunner.cs`
- `packages/pumpkin-ts-models/src/forms.ts`
- `packages/pumpkin-block-views/src/views/FormBlockView.tsx`

## Upstream Source Paths Selected For Adoption Or Adaptation

| Upstream path | Decision before source change | Reason |
| --- | --- | --- |
| `apps/starter-app/` | adopt as additive local source app | Missing locally; partner identifies this as future base for new Pumpkin sites. Import is additive and does not touch live runtime. |
| `apps/sample-app-2/` | defer source import | Useful sample, but redundant beside `starter-app`; adding both at once increases review/build surface. |
| `apps/pumpkin-api` form routes | adapt by comparison only | Active repo already has public/custom/admin form routes and aliases; no replacement needed before tests. |
| `apps/admin` form designer/admin UX | defer direct port | Active Admin UI already has form builder and operator surfaces; starter-app designer can be evaluated later. |
| `packages/pumpkin-ts-models` FormDefinition model files | adapt by comparison only | Active repo has richer `src/forms.ts`; direct replacement would risk downstream compatibility. |
| `packages/pumpkin-block-views` FormBlock renderer | preserve active implementation | Active repo already has FormBlockView and defaults. |

## Explicit Rejects And Defers

- Reject blind merge.
- Reject replacing the standalone Admin UI with starter-app embedded `/admin`.
- Reject source changes that remove DomainBinding, Backup Manager, Package Intake, ImportExecution, OperatorHandoff, OutboundLinks, static-contact, or external compatibility aliases.
- Defer `apps/sample-app-2`.
- Defer customer-facing contact/form POST proof.
- Defer deploy and live proof to a later approved phase.

## No-Airstrip Proof Plan

- Do not run Airstrip route probes.
- Do not run Airstrip responsive checks.
- Do not touch Airstrip source, CMS records, media, DomainBinding, deployment, appsettings, DNS, or default/custom hosts.
- Use only non-Airstrip GET checks for runtime no-regression: Ice public routes, Ice static-contact health, Pumpkin API health, and Admin UI production.
