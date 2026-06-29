# Admin Tenant Scope Review

Admin UI source:

- `apps/admin/src/lib/api.ts` threads `tenantId` through page, media, FormEntry, publish-run, and import-run calls.
- `apps/admin/src/app/dashboard/pages/page.tsx` uses `currentTenant.tenantId` for page list/create/update behavior.
- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx` loads tenant from query/current user and verifies loaded page tenant.
- `apps/admin/src/app/dashboard/pages/import-export/page.tsx` validates wrapper/page tenant ID, supports explicit tenant rewrite, and uses selected tenant for writes.
- Import run pages require route tenant to match current tenant before loading.

Result:

- Admin source behavior is tenant-aware.
- Live Admin UI proof is not possible because no deployed Admin UI resource exists.
- Live Admin API proof requiring JWT was skipped because approved hard-copy credentials were not parseable for this phase.
