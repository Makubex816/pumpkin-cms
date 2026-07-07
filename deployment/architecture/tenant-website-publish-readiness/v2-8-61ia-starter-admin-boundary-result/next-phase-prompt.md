# Next Phase Prompt

Approve V2.8.61J Non-Airstrip Starter App Local/Sandbox Proof only.

Use the completed V2.8.61IA starter admin boundary result. Starter `/admin` is classified as tenant-site-local only, with standalone `apps/admin` preserved as the platform/SuperAdmin source of truth.

Scope:

- Add or use an approved starter lockfile/safe dependency install path.
- Install dependencies only inside `apps/starter-app`.
- Run starter type-check, lint, and build.
- Use only local runtime or an explicitly named existing non-Airstrip sandbox.
- Prove starter public routes and starter `/admin` GET behavior.
- Confirm starter `/admin` exposes only tenant-local dashboard, pages, page map, forms, and themes.

Hard stops:

- No Airstrip proof, probe, deploy, or mutation.
- No new Azure resources.
- No live appsetting, DNS, custom-domain, content, media, user, role, tenant, storage, Cosmos, DomainBinding, or indexing mutation.
- No contact POST, form submission, or customer-facing POST proof without separate approval.
