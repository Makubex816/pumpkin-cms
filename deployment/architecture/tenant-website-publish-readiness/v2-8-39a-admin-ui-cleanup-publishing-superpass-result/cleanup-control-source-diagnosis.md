# Cleanup Control Source Diagnosis

Source diagnosis result: no Admin UI source fix was made.

Findings:

- The Admin UI rollback control is wired to `handleRollback`, prompts for confirmation, and then calls `apiClient.rollbackPage`.
- The rollback client method posts to the Admin rollback route.
- The Admin UI Pages list explicitly documents that hard delete is not exposed.
- The Admin UI create and edit flows already expose `Published` and `Include in sitemap` controls.

Source references:

- `apps/admin/src/app/dashboard/pages/[id]/view/page.tsx`: rollback button handler and confirmation gate.
- `apps/admin/src/lib/api.ts`: `rollbackPage` Admin route call.
- `apps/admin/src/app/dashboard/pages/page.tsx`: hard delete not exposed; create modal publish/sitemap controls.
- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`: edit-page publish/sitemap controls.
- `apps/pumpkin-api/Program.cs`: public page read, public page delete, sitemap, Admin create, Admin update, and Admin rollback routes.

Classification: `admin_ui_delete_cleanup_control_gap_with_rollback_confirm_gate`.

The V2.8.39 no-request observation is consistent with an unaccepted browser confirmation path. For actual cleanup, rollback is not a delete/revert-to-absence mechanism, so the approved tenant-authenticated delete fallback was required.

