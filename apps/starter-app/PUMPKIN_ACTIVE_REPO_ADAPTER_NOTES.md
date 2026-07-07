# Pumpkin Active Repo Adapter Notes

Status: V2.8.61I additive source import.

This app was imported from SDI-AI upstream main commit `565a8afd669a42224a9d15759f7060faa375d000` as the immutable partner starter baseline for future Pumpkin tenant sites.

Integration boundaries:

- Do not deploy this app from V2.8.61I.
- Do not use this app for Airstrip proof.
- Do not replace the standalone production Admin UI with this app's embedded `/admin`.
- Treat `src/app/admin/**` and `src/app/api/admin/**` as starter-template reference surfaces until a later isolated proof approves their runtime use.
- Keep active repo DomainBinding, Backup Manager, Package Intake, OperatorHandoff, ImportExecution, OutboundLinks, static-contact, and external compatibility aliases as downstream extensions.

Future adapter work:

- Decide whether embedded `/admin` remains starter-only or becomes an optional tenant-local admin mode.
- Compare starter form designer UX against `apps/admin/src/app/dashboard/form-builder`.
- Compare starter form submission flow against the active Pumpkin API routes and FormSubmissionGuard.
- Add an isolated starter-app build/proof phase before any production use.
