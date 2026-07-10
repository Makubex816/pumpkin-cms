# Party Pros Host Routing V2.8.61OQ

Status: implemented and deployed.

The starter app now resolves request hostnames through a generic host-to-tenant route helper:

- `partyrentalphiladelphia.com` -> `party-pros-philadelphia`
- `www.partyrentalphiladelphia.com` -> `party-pros-philadelphia`

Implementation notes:

- Route records are centralized in `apps/starter-app/src/lib/host-tenant-routing.ts`.
- Future mappings can be supplied with `PUMPKIN_HOST_TENANT_ROUTES_JSON`.
- Site layout and page routes use host-aware preview fixture rendering.
- Preview fixture URL mode keeps `/preview/...` routes unchanged while custom-domain rendering uses normal site URLs.
- Site layout and routes are dynamic to avoid cross-host cached content.
- Forms render in preview-disabled mode for this phase.

Deployed proof:

- `http://partyrentalphiladelphia.com/`: 200, Party Pros marker.
- `http://partyrentalphiladelphia.com/contact`: 200, disabled no-post form.
- `http://partyrentalphiladelphia.com/service-areas`: 200, Party Pros marker.
- `http://www.partyrentalphiladelphia.com/`: 200, Party Pros marker.
- `http://www.partyrentalphiladelphia.com/contact`: 200, disabled no-post form.
- `http://www.partyrentalphiladelphia.com/service-areas`: 200, Party Pros marker.
