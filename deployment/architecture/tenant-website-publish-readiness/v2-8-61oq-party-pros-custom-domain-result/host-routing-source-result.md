# Host Routing Source Result

Status: implemented.

Source discovery found that public starter routes previously used only `loadTenantConfig()` and did not route by request host.

Implemented source:

- `apps/starter-app/src/lib/host-tenant-routing.ts`
- `apps/starter-app/src/lib/preview-fixtures.ts`
- `apps/starter-app/src/app/(site)/layout.tsx`
- `apps/starter-app/src/app/(site)/page.tsx`
- `apps/starter-app/src/app/(site)/[...slug]/page.tsx`

Behavior:

- Maps `partyrentalphiladelphia.com` and `www.partyrentalphiladelphia.com` to tenant `party-pros-philadelphia`.
- Uses generic host route records rather than Party Pros page-specific branching.
- Supports future host mappings through `PUMPKIN_HOST_TENANT_ROUTES_JSON`.
- Uses preview fixture source and `previewMode` so forms remain no-post.
- Keeps preview route behavior unchanged.
- Converts preview menu URLs to normal site paths for custom-domain rendering.
- Forces dynamic rendering on site routes/layout to avoid cross-host cached content.

Local staged standalone host-header proof passed before deploy:

| Route | Status | Party Pros marker | Host tenant marker | No POST method | No form action |
| --- | ---: | --- | --- | --- | --- |
| `/` | 200 | yes | yes | yes | yes |
| `/contact` | 200 | yes | yes | yes | yes |
| `/service-areas` | 200 | yes | yes | yes | yes |
