# Integration Risk Register

| Risk | Severity | Evidence | Mitigation |
| --- | --- | --- | --- |
| Route collision in Pumpkin API | High | Upstream and active repo both define public/admin form routes | Contract-diff Program.cs and route tests before integration. |
| Dropped compatibility aliases | High | Active repo supports `/api/admin/{tenantId}/form-entries`; upstream centers `/api/admin/forms/{tenantId}/entries` | Preserve aliases until Admin UI and external clients are migrated. |
| Data model drift | High | FormDefinition/FormEntry/Theme changed in net and TS models | Add serialization/backfill tests and read-only data sampling before writes. |
| Admin auth/role mismatch | Medium | Upstream roles include Editor/Viewer; active production gates include SuperAdmin/TenantAdmin/operator surfaces | Map roles before Admin UI port. |
| Embedded starter admin conflicts | High | `apps/starter-app` includes `/admin` and local admin API routes | Treat as template/reference, not production Admin UI replacement. |
| DomainBinding/backup/intake loss | High | Upstream lacks active operational systems | Never merge over active branch without preservation checklist. |
| Customer-facing POST regression | High | Upstream custom submit route is customer-facing | Require explicit POST/form-submit approval and bounded proof later. |
| Airstrip cutover delay | Medium | External refresh paused the secure handoff | Owner can resume current cutover separately without upstream integration. |
| Package/compiler assumptions shift | Medium | Starter/sample app adds new source shape | Update package intake maps in a later template-intake phase. |
| Static contact regression | Medium | Form/contact work overlaps general contact concepts | Keep Ice static-contact closed unless separately approved. |
