# Unpublished Page Preview Gap

Gap: the starter app has no source-supported unpublished page preview path for Party Pros.

Relevant source behavior:

- `fetchPumpkinPage(slug)` calls `/api/pages/{tenantId}/{slug}`.
- The slug page calls `notFound()` when `fetchPumpkinPage` returns `null`.
- Home falls back to bundled Pumpkin content when no tenant page is returned.
- No route calls an admin/draft page endpoint for site preview.
- No route accepts a preview context that can render unpublished Party Pros pages read-only.

Party Pros state carried forward from OF/OE:

- Pages: `home`, `contact`, `service-areas`
- Publish state: all unpublished
- Sitemap pages: 0

Impact:

- Binding the starter to Party Pros alone would not prove the requested customer-preview pages while they remain unpublished, because the runtime is published-only.
- Publishing pages was not approved in OI.
- Appsetting mutation was not approved in OI.

Repair requirement:

V2.8.61OJ should add or approve a read-only preview mechanism that can render unpublished Party Pros pages without publishing them and without submitting forms.

