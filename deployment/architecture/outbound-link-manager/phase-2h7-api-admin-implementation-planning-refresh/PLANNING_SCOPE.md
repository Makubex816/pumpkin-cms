# Planning Scope

Phase 2H-7 is a production-readiness planning pass for moving the Outbound Link Manager from local/offline tooling toward guarded Pumpkin API and Admin implementation.

Approved outputs:

- API endpoint contract plan.
- Service boundary plan.
- Request and response model plan.
- Database migration and provider strategy.
- Admin UI screen, route, and component plan.
- Permission, role, audit, and bulk-action plans.
- Scan-run and rendering integration gates.
- Backup Center, onboarding, and tenant bundle handoff plans.
- Local-first, live-readonly, and future live-write-approved behavior.
- Test, fixture, rollout, risk, and next-phase plans.

Source structure review was limited to safe source files and directory shape:

- Pumpkin API uses a .NET minimal API style with service classes under `apps/pumpkin-api/Services/`.
- Admin uses a Next dashboard app under `apps/admin/src/app/dashboard/` with a shared API client at `apps/admin/src/lib/api.ts`.

No protected config was read.

