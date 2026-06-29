# Admin UI Resource Link Map

## Azure Resources

- Resource group: `rg-pumpkin-api-prod-centralus`
- Isolated Admin Web App: `app-pumpkin-admin-isolated-centralus-001`
- Production Admin Web App: `app-pumpkin-admin-prod-centralus-001`
- Pumpkin API Web App: `app-pumpkin-api-prod-centralus-001`

## Public URLs

- Isolated Admin UI: `https://app-pumpkin-admin-isolated-centralus-001.azurewebsites.net`
- Production Admin UI: `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net`
- Pumpkin API health: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health`

## Source Paths

- Admin UI Next config: `apps/admin/next.config.js`
- Admin root metadata: `apps/admin/src/app/layout.tsx`
- Admin robots route: `apps/admin/src/app/robots.ts`
- Admin API client: `apps/admin/src/lib/api.ts`
- Auth/session context: `apps/admin/src/contexts/AuthContext.tsx`
- Route guard: `apps/admin/src/components/ProtectedRoute.tsx`
- Dashboard shell: `apps/admin/src/app/dashboard/layout.tsx`
- Pages route: `apps/admin/src/app/dashboard/pages/page.tsx`

## Operator References

- V2.8.39A closeout package: `deployment/architecture/tenant-website-publish-readiness/v2-8-39a-admin-ui-cleanup-publishing-superpass-result/`
- V2.8.40 closeout package: `deployment/architecture/tenant-website-publish-readiness/v2-8-40-admin-ui-production-hardening-result/`

