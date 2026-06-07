# System Goals and Non-Goals

## Goals

- Support many independent tenant sites without copy-pasted launch work.
- Make tenant setup understandable for low-skill users.
- Produce import-ready, schema-validated tenant packages.
- Keep CMS writes, media updates, DNS, hosting, email, and indexing behind explicit approval gates.
- Preserve tenant isolation for routes, media, forms, analytics, and extensions.
- Support multiple deployment profiles instead of assuming one hosting path.
- Produce support packets that let operators diagnose issues without secrets.
- Make rollback ownership and procedures part of onboarding, not an afterthought.

## Non-Goals

- No Admin UI wizard implementation in this phase.
- No CLI implementation in this phase.
- No new tenant creation.
- No external infrastructure creation or mutation.
- No CMS, MediaAsset, Azure, Cloudflare, Function App, Microsoft 365, email, deployment, Search Console, or indexing action.
- No plugin marketplace in the first version.
- No arbitrary code drop-ins by tenants or operators.
- No secret storage in docs, examples, git, or generated support packets.

