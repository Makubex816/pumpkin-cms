# Tracked File Classification

Status: completed.

Tracked modified count: 161.

Tracked deleted count: 0.

| Bucket | Count | Disposition |
| --- | ---: | --- |
| commit-ready reports/docs | 148 | Candidate docs commit after owner review. |
| source needs review | 8 | Do not commit with reports; split into source review lane. |
| generated/source-controlled ambiguity | 4 | Owner decision needed before staging. |
| security-boundary doc review | 1 | Documentation path only; do not stage casually. |

Tracked docs/report candidates include:

- Root platform reports and trackers.
- `deployment/architecture/multi-tenant-onboarding-system/` documentation, runbooks, schemas, roadmap, validator design, wizard design, and plugin-extension design.
- `deployment/architecture/pumpkin-backup-export-restore/phase-2f12n-real-resource-registry-live-inventory-result/BLOCKERS_OR_WARNINGS.md`.
- `deployment/azure/ice-static-form-real-email-delivery-preflight/` docs.
- `deployment/static-azure/` docs and one script.

Tracked source-adjacent review candidates:

- `apps/admin/package.json`
- `apps/admin/src/components/outbound-links/docs/ADMIN_WRITE_ACTIONS_DISABLED.md`
- `apps/admin/src/components/outbound-links/docs/KNOWN_LIMITATIONS.md`
- `apps/admin/src/components/outbound-links/docs/NEXT_PHASE_2H11_WRITE_ACTION_PREFLIGHT_PROMPT.md`
- `apps/ice-rink-web/.gitignore`
- `apps/ice-rink-web/src/app/[...slug]/page.tsx`
- `apps/ice-rink-web/src/app/page.tsx`
- `apps/ice-rink-web/src/components/PageRenderer.tsx`

Generated/source-controlled ambiguity:

- `packages/pumpkin-ts-models/dist/models/IHtmlBlock.d.ts`
- `packages/pumpkin-ts-models/dist/models/IHtmlBlock.d.ts.map`
- `packages/pumpkin-ts-models/dist/models/Page.d.ts`
- `packages/pumpkin-ts-models/dist/models/Page.d.ts.map`

Recommendation:

- Stage tracked documentation only in a coherent docs batch after owner review.
- Keep source changes separate from report/doc batches.
- Do not stage `packages/.../dist` until the owner confirms package dist files are intended source-controlled outputs.
