# Party Pros Preview Capability Classification

Overall classification: `blocked`.

| Capability | Classification | Reason |
| --- | --- | --- |
| Starter default host runtime | `available` | Existing host returns 200 for `/` and `/admin/login`, 307 for `/admin`. |
| Starter tenant-local admin | `available_unbound` | Source supports tenant-local workflows, but current host has no tenant id or tenant API key setting. |
| Live CMS published runtime | `source_supported_with_binding` | Source can fetch published CMS pages when tenant id, API URL, and tenant API key are configured. |
| Live CMS unpublished preview | `not_source_supported` | Runtime fetches public published page endpoints and 404s when no page is returned. |
| Party Pros current public preview | `blocked_by_unpublished_pages` | Party Pros pages are all unpublished. |
| Party Pros current shared-host preview | `blocked_by_missing_tenant_binding` | Current host has no `PUMPKIN_TENANT_ID` or `PUMPKIN_API_KEY` appsetting names. |
| Compiled package fixture preview | `blocked_by_missing_adapter` | No route loads the compiled package directly. |
| Static Party Pros preview route | `not_source_supported` | No static Party Pros route exists in `apps/starter-app`. |
| Form render proof for Party Pros | `blocked_with_no_post` | Party Pros page preview did not run; no form submit route was invoked. |

Preview cannot be proved under OI constraints without one of these separately approved changes:

- Secure tenant-bound preview configuration plus a read-only preview path for unpublished pages.
- A compiled-package fixture adapter that renders Party Pros records without live CMS mutation.
- A temporary static preview route generated from the compiled package.

No such change was approved or performed in OI.

