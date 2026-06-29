# Active Scope And Exclusions

Active in V2.8.36:

- Tenant model and API key path.
- User/Admin identity model.
- Admin RBAC.
- Public pages and sitemap endpoint contract.
- Admin page endpoint contract.
- Content hierarchy endpoint contract.
- `Page`, `MediaAsset`, `PublishRun`, and `ImportRun` containers.
- Admin UI page/content readiness.
- Media tenant isolation.
- Roller-rink-rentals readiness analysis.

Explicitly excluded:

- Theme endpoint implementation or validation.
- Theme container creation.
- Theme data migration.
- Form Definition endpoint implementation or validation.
- `forms` container creation.
- Form Definition data migration.
- New form submission validation.
- Additional contact POSTs.

FormEntry was used only as carryforward no-regression evidence.
