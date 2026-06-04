# Staging Deployment Blockers

## Blockers Before Static Dry Run

- Static route expectations still contain older Ice routes.
- Existing CMS snapshot is stale and generated from older live content.
- Existing static artifacts/out folders are stale and ignored.
- Fresh CMS snapshot/export would create generated artifacts and needs separate authorization.

## Blockers Before Azure Static Web App Staging

- No current validated Ice static artifact exists for `/`, `/contact`, and `/service-areas`.
- Media URLs are still local-dev `/media/...` paths.
- Azure Blob media path has not been provisioned or validated.
- Cloudflare media hostname has not been configured.
- Static contact form endpoint has not been deployed or tested.
- Azure Static Web App staging resource/default hostname has not been created.
- Static validators/runbooks still list older route expectations.
- Sitemap/robots/indexing policy is not production-ready.

## Blockers Before Production DNS

- Azure staging has not been created or validated.
- Production media URLs are not live.
- Production contact form path is not live.
- Cloudflare/DNS cutover has not been approved.
- Rollback package and cache/purge runbook have not been validated from a current artifact.

## Result

Ready for Azure Static Web App staging deployment: no.

