# Pumpkin Starter App Party Pros Preview Readiness V2.8.61OH

Status: ready for a separately approved preview binding phase.

V2.8.61OH did not bind the shared starter host to Party Pros because tenant-specific API key or preview token settings were not approved and Party Pros page publishing remains blocked.

Current state:

- Shared starter host exists and responds on default Azure host.
- Public Pumpkin API base URL is configured.
- No `PUMPKIN_TENANT_ID` or `PUMPKIN_API_KEY` appsetting was added.
- Party Pros content, media, users, forms, and publish state were not mutated.

Next phase should approve a read-only Party Pros preview binding path and keep DNS/custom-domain, contact POST, form submission, customer-facing POST, Airstrip, Ice, and platform deploy actions blocked unless separately approved.
