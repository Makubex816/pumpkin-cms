# Root Cause Classification

Result: root cause classified.

Primary categories:

- `static_export_excludes_api_route`
- `api_handler_missing_from_static_artifact`

Contributing categories:

- `managed_functions_not_deployed`
- `bring_your_own_api_not_linked`
- `frontend_points_to_wrong_endpoint`

Rejected as primary:

- `api_handler_present_but_method_not_allowed`
- `staticwebapp_config_route_misconfigured`
- `recipient_provider_config_required`

Evidence:

- Source has a Next runtime `POST /api/contact` handler.
- Static export mode does not ship that handler into `out`.
- Selected V2.8.19H production artifact has no `out/api` directory.
- Selected V2.8.19H production artifact has `renderMode: static`.
- Selected V2.8.19H production artifact has an empty `staticFormEndpoint`.
- Local static function scaffold exposes `/api/static-contact`, not deployed `/api/contact`.
- Production GET/HEAD/OPTIONS for `/api/contact` returned 404 with no `Allow` header.
- V2.8.20 production POST for `/api/contact` returned 405 with empty body.

Conclusion:

The 405 was caused by posting to a path that is not backed by a deployed contact API in the static production artifact. The production static site needs an approved public static form endpoint and deployment/linking path before another live contact POST retry.
