# Pumpkin Starter App Tenant-Local Admin V2.8.61IA

Decision: starter `/admin` is tenant-site-local only.

The starter app admin is allowed to manage only the configured tenant site's local pages, page map, forms, and themes. It is not the platform control plane and must not replace the standalone Admin UI.

Platform controls that stay outside starter `/admin`:

- Backup Manager;
- Package Intake and Universal Onboarding;
- Domain Manager;
- users/admins platform management;
- hardcopy/recovery/resource controls;
- cross-tenant operations.

Source marker:

- `apps/starter-app/src/lib/starter-admin-boundary.ts`
