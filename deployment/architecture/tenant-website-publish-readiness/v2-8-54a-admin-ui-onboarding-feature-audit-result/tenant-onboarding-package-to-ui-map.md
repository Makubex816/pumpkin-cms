# Tenant Onboarding Package To UI Map

Package root:

- `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/`

| Package Area | Package Files | UI Surface | Current Mapping |
| --- | --- | --- | --- |
| Tenant profile | `tenant-profile.json`, `tenant-package.json` | `/dashboard/tenants` | Tenant UI can list/create/update by source; creation not approved |
| Domains | `domains.json` | publishing/runbooks | No complete Admin UI domain wizard |
| Brand | `brand.json` | `/dashboard/themes`, `/dashboard/icons` | Brand influences theme/icon review |
| Theme | `theme.json` | `/dashboard/themes`, `/dashboard/themes/[id]` | UI CRUD browser-proven in V2.8.49 |
| Pages | `pages/*.json` | `/dashboard/pages`, `/dashboard/pages/import-export` | UI supports page edit and import/export dry-run/write by source |
| Forms | `forms/*.json` | `/dashboard/form-builder` | UI CRUD browser-proven in V2.8.49 |
| Media | `media/manifest.json` | `/dashboard/media` | UI upload/source present; upload requires separate approval |
| Users | `users/admin-users.json` | no complete onboarding wizard | Secure/live mutation phase required |
| Publish | `publish/static-site.json` | `/dashboard/publishing`, `/dashboard/publishing/action-center` | UI review present; deploy separate |
| Monitoring | `monitoring/runtime-checks.json` | runtime proof reports | No full Admin UI workflow |
| Validation | `validation/expected-routes.json` | validator/result reports | CLI/Codex driven today |
| Contact/static form | `contact/static-contact.json` | `/dashboard/form-builder`, `/dashboard/forms` | FormDefinition and readback UI exist; static-contact secure values remain outside repo |

Package validation remains read-only. Tenant creation, media upload, deploy, DNS, indexing, appsetting changes, and secure binding require separate approvals.

