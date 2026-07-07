# Starter Admin Boundary Recheck

Status: pass.

Starter `/admin` remains tenant-local only:

- dashboard;
- pages;
- page map;
- forms;
- themes.

Denied platform controls remain absent from starter routes:

- Backup Manager;
- Package Intake;
- Domain Manager;
- users/admins platform management;
- hardcopy/recovery/resource controls;
- cross-tenant operations.

Source scan note:

- denied-control terms match only the explicit denied-control list in `apps/starter-app/src/lib/starter-admin-boundary.ts`.
