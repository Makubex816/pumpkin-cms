# Static Deployment Remaining Gates

Static generation status: not run.

Azure deployment status: not run.

DNS/Cloudflare status: not changed.

Cosmos production status: planned, not provisioned.

Blob/media production status: planned, not provisioned.

Remaining gates before Azure staging:

- Confirm production architecture decisions for CMS data, media storage, environment separation, and rollback.
- Prepare Azure staging resources and app configuration without reading protected local config in this task.
- Decide production Cosmos/database approach.
- Decide production Blob/media storage approach.
- Run static generation only after explicit authorization.
- Validate generated static routes, forms, media paths, metadata, sitemap behavior, robots/indexing policy, and rollback plan.
- Run Azure staging deploy only after explicit authorization.

Remaining gates before DNS cutover:

- Complete Azure staging smoke tests.
- Confirm DNS, Cloudflare, Microsoft 365, Bluehost, and email/provider plan.
- Confirm production indexing policy.
- Confirm monitoring, logs, backup, rollback, and incident paths.
- Obtain explicit authorization for DNS/provider changes.
