# Incident Triage Runbook

1. Confirm whether the incident is public website, Pumpkin API, Admin UI, Cosmos, media storage, or Static Web Apps.
2. Use GET-only health probes first: public routes, Pumpkin API `/health`, Pumpkin API `/api/health`, Admin UI `/`, and Admin UI `/login`.
3. Check Azure Monitor alerts and Log Analytics for the affected resource.
4. Do not POST contact forms during triage unless an approved contact proof phase exists.
5. Do not mutate DNS/indexing during incident triage.
6. If restore is needed, create a scoped restore approval that names resource, tenant, timestamp, and rollback plan.
