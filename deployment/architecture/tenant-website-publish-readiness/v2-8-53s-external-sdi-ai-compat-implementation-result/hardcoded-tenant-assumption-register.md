# Hardcoded Tenant Assumption Register

Current hard-coded Ice/Roller assumptions remain outside V2.8.53S source repair scope.

Observed assumption areas:

| Area | Representative files |
| --- | --- |
| Static site key/domain maps | `apps/ice-rink-web/src/config/sites.ts`, `apps/ice-rink-web/src/lib/render-mode.ts` |
| Static publish and snapshot scripts | `apps/ice-rink-web/scripts/static-publish.mjs`, `apps/ice-rink-web/scripts/snapshot-cms-content.mjs` |
| Admin publish readiness | `apps/admin/src/lib/publishing-readiness.ts` |
| Admin preview local hosts | `apps/admin/src/app/dashboard/pages/page.tsx`, `apps/admin/src/app/dashboard/form-builder/page.tsx` |
| Provider metadata | `apps/pumpkin-api/Services/ProviderMetadataService.cs` |
| Design system route requirements | `apps/pumpkin-api/Services/DesignSystemGuard.cs`, `apps/admin/src/app/dashboard/themes/[id]/page.tsx` |

Secondary tenant expansion must address these assumptions before any tenant creation/write approval.
