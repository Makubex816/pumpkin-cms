# Pumpkin Active Repo Adapter Notes

Status: V2.8.61IA tenant-local admin boundary classified.

This app was imported from SDI-AI upstream main commit `565a8afd669a42224a9d15759f7060faa375d000` as the immutable partner starter baseline for future Pumpkin tenant sites.

Integration boundaries:

- Do not deploy this app from V2.8.61I.
- Do not use this app for Airstrip proof.
- Do not replace the standalone production Admin UI with this app's embedded `/admin`.
- Treat `src/app/admin/**` and `src/app/api/admin/**` as tenant-site-local admin surfaces for the configured starter tenant.
- Keep starter admin workflows limited to dashboard, pages, page map, forms, and themes through `src/lib/starter-admin-boundary.ts`.
- Do not add Backup Manager, Package Intake, Domain Manager, users/admins platform management, hardcopy/recovery/resource controls, or cross-tenant operations to starter `/admin`.
- Keep active repo DomainBinding, Backup Manager, Package Intake, OperatorHandoff, ImportExecution, OutboundLinks, static-contact, and external compatibility aliases as downstream extensions.

Future adapter work:

- Prove starter `/admin` in a non-Airstrip sandbox before any production use.
- Compare starter form designer UX against `apps/admin/src/app/dashboard/form-builder`.
- Compare starter form submission flow against the active Pumpkin API routes and FormSubmissionGuard.
- Add an isolated starter-app build/proof phase before any production use.
