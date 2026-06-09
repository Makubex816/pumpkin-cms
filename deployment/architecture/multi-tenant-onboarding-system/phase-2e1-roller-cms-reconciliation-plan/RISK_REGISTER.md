# Risk Register

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Existing tenant is stale or unintended | High | Require owner confirmation before adopt/update/create decisions. |
| Existing `home` or `contact` content differs from local package | High | Require read-only content comparison and owner-approved deltas before writes. |
| `service-areas` route exists in hidden/legacy state | High | Require read-only refresh before any create. |
| `roller-rink-rentals` page has unclear purpose | Medium | Preserve until owner decides whether it is canonical, legacy, duplicate, or redirect source. |
| Sitemap-included pages remain `noindex,nofollow` | Medium | Preserve now; require separate SEO/sitemap approval later. |
| Form-recipient registry location is unknown | Medium | Do not write forms; require implementation/read-only evidence before mapping. |
| Media reference has no CMS media asset record | Medium | Keep as local reference; require media rights and MediaAsset approval later. |
| Future approval accidentally includes external systems | High | Abort if Azure, Cloudflare, DNS, deployment, email, Search Console, indexing, or live pages are included. |
| Raw generated package output is staged accidentally | High | Keep `.tmp` ignored and run staged-path checks before any commit. |
