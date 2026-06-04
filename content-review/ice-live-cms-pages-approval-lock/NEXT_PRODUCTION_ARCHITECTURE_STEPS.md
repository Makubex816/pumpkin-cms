# Next Production Architecture Steps

Recommended next action: prepare the Azure/static production architecture and staging readiness plan without changing providers or deploying.

Suggested next-step checklist:

- Define static generation input source and build artifact boundaries.
- Define Azure App Service or Static Web App hosting target.
- Define Cosmos/database production provisioning plan.
- Define Blob/media production storage plan.
- Define environment variable and secret handling plan without exposing protected config.
- Define contact form delivery path, Microsoft 365/provider requirements, and email-sending approval gates.
- Define DNS/Cloudflare/Microsoft 365/Bluehost cutover plan.
- Define staging smoke tests for `/`, `/contact`, and `/service-areas`.
- Define rollback plan for CMS content, static artifacts, deployment, and DNS.
- Define production indexing and sitemap release gate.

Current readiness classification:

- Live CMS visual approval: yes
- Static generation ready: next gate, not yet run
- Azure staging ready: no, architecture/docs/setup still needed
- Production DNS ready: no
- Production/indexing ready: no
