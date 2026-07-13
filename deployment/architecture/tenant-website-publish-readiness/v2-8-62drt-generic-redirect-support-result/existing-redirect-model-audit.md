# Existing Redirect Model Audit

The audit covered `Page`, `PageRedirect`, `PageRevisionHelper.MergeRedirects`, `PageRedirectGuard`, Cosmos/Mongo page persistence, Admin page endpoints, public page lookup, starter routing, import tooling, and Admin UI source.

The page-owned model is insufficient for the two required mappings:

- `PageRevisionHelper.MergeRedirects` drops a redirect whose normalized source equals the current page slug.
- `PageRedirectGuard.NormalizeSlug` flattens nested routes and was designed for page aliases, not a route graph.
- The page contract supports only permanent `301` behavior.
- Existing collision checks reject active page sources without an explicit redirect-before-page relationship.
- No generic graph-wide two-node or multi-node cycle validator exists.
- Public page resolution returns a target page object rather than HTTP redirect metadata.
- No dedicated Admin CRUD/list/validate contract exists.

Admin UI source has no redirect-rule editor. DRT therefore selected a dedicated model rather than adding a competing special case to page revision behavior.
