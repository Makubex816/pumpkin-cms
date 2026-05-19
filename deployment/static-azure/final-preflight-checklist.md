# Final Preflight Checklist

Use this before any real Azure or Cloudflare deployment.

## Repository

- Repo is clean or only approved deployment docs are changed.
- Latest branch is pushed.
- No `.env.local` changes are present.
- No `appsettings.Development.json` changes are present.
- No production credentials are in repo files.
- No active `.github/workflows` files were added unintentionally.

## Dry Run

- `npm run publish:dry-run` has been run from `apps/ice-rink-web`.
- Dry-run manifest exists.
- Dry-run summary exists.
- Dry-run release folder is ignored by git.
- Ice upload folder exists.
- Roller upload folder exists.

## Validation

- Ice validator passed.
- Roller validator passed.
- No `.env*` files in output.
- No `appsettings.*.json` files in output.
- High-confidence secret scan passed.
- Required route files exist.

## Sitemap And Robots

- Ice `sitemap.xml` exists.
- Ice `robots.txt` exists.
- Ice sitemap uses `https://iceskatingrinkrentals.com`.
- Roller `sitemap.xml` exists.
- Roller `robots.txt` exists.
- Roller sitemap uses `https://rollerrinkrentals.com`.

## Canonical URLs

- Ice canonical URLs use the Ice domain.
- Roller canonical URLs use the Roller domain.
- No opposite-domain canonical leakage is present.
- Staging canonical behavior is understood before sharing staging URLs.

## Forms

- Static form endpoint decision is made.
- If endpoint is configured, it is a URL only.
- Endpoint credentials are stored outside the repo.
- CORS allowed origins are documented.
- Cache bypass is planned for the endpoint.
- Spam/rate-limit plan exists.

## Azure Resource Choice

Choose one:

- Azure Static Web Apps
- Azure Storage Static Website + Cloudflare
- Hold deployment and keep building

Record the decision and reason.

## Cloudflare Plan

- Existing DNS records are documented.
- Staging subdomain plan is documented.
- Orange-cloud vs DNS-only choice is documented.
- Static asset cache rule is planned.
- HTML cache caution is documented.
- Form endpoint bypass is planned.
- SSL mode is planned.

## Rollback

- Previous known-good artifact is saved.
- DNS rollback notes are saved.
- Cloudflare purge plan is documented.
- Post-rollback route verification list is ready.

## Approval

- Timothy has reviewed the decision package.
- Timothy has selected the first deployment option.
- The exact next manual step is assigned to a human operator.
