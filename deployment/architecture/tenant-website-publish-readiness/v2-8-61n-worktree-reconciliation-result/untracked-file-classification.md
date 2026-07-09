# Untracked File Classification

Status: completed.

Untracked non-ignored count: 627.

| Bucket | Count | Disposition |
| --- | ---: | --- |
| commit-ready report/result candidates | 522 | Split and commit by phase only after owner review. |
| source needs review | 37 | Engineer review required; do not mix with report commits. |
| tenant package/content-review artifacts | 36 | Do not stage; archive or delete only after owner decision. |
| secure/redaction/hardcopy-themed report paths | 29 | Review path/content before any staging. |
| visual/proof artifacts | 3 | Do not stage unless intentionally approved. |

Report/result phase clusters visible:

- Backup/export/restore planning reports: phase `2F12B`, `2F12F`, and related result folders.
- Multi-tenant onboarding result batches: `v2-11-7a`, `v2-11-8`, `v2-11-9`, `v2-11-10`, `v2-12-2`, `v2-12-3`, `v2-12-4`.
- Outbound Link Manager result batches: `2H6A`, `2H11`, `2H13`, `2H18`, `2H19`, `2H23`, `2H23A`, `2H24`.
- Tenant website readiness result batches: `v2-8-16`, `v2-8-19a2`, `v2-8-19a3`, `v2-8-19h`, `v2-8-45c`, `v2-8-54e`, `v2-8-61-bluehost`.
- Pumpkin platform Airstrip DNS/domain runtime docs.

Source review clusters visible:

- Admin UI import-execution projection scripts/components/libs.
- Admin UI operator-handoff scripts/components/libs.
- Pumpkin API ImportExecutions services and tests.
- Pumpkin API OperatorHandoffs services and tests.
- `ProviderMetadataService.cs`.
- Multi-tenant onboarding governance implementation source/tests.

Tenant package/content-review clusters:

- `content-review/ice-final-contact-input/`
- `content-review/ice-service-areas-input/`

Visual/proof artifact cluster:

- `test-results/.last-run.json`
- Screenshot candidate summaries under old V2.8.19 result folders.

Recommendation:

- Treat report/result folders as commit candidates only after grouping by phase.
- Treat source files as separate source-review candidates.
- Treat content-review and test-results as do-not-stage artifacts.
