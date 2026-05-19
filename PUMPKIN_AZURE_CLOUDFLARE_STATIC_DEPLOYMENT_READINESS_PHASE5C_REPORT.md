# Pumpkin Azure/Cloudflare Static Deployment Readiness Phase 5C Report

## Executive Summary

Phase 5C added deployment readiness material for the confirmed Option C static-first publishing workflow. No live Azure deployment was attempted, no Cloudflare settings were changed, and no production credentials or secret values were added.

The new readiness layer documents how to build per-tenant static output for Ice Rink Rentals and Roller Rink Rentals, how to validate the generated artifacts before upload, and how Azure Static Web Apps, Azure Storage static website hosting, Cloudflare DNS/cache rules, and static form handling should be approached.

## Files Added

- `deployment/static-azure/github-actions-examples/static-export-ice.yml.example`
- `deployment/static-azure/github-actions-examples/static-export-roller.yml.example`
- `deployment/static-azure/README.md`
- `deployment/static-azure/azure-resource-checklist.md`
- `deployment/static-azure/cloudflare-cache-rules.md`
- `deployment/static-azure/static-form-strategy.md`
- `deployment/static-azure/validate-static-output.mjs`
- `PUMPKIN_AZURE_CLOUDFLARE_STATIC_DEPLOYMENT_READINESS_PHASE5C_REPORT.md`

No application source files were changed in this phase.

## Readiness Summary

The deployment readiness folder now explains the Option C path:

- Generate site-specific static output from `apps/ice-rink-web`.
- Validate static output before upload.
- Deploy separate static artifacts per tenant/domain.
- Put Cloudflare in front for DNS, CDN, WAF, and future purge workflows.
- Keep forms out of static-only assumptions until an external form endpoint exists.

The example GitHub Actions files are stored outside `.github/workflows` with a `.yml.example` suffix so they are documentation templates, not active workflows. They use `workflow_dispatch` and a required confirmation input for future use, and they reference placeholder GitHub secret names only:

- `AZURE_STATIC_WEB_APPS_API_TOKEN_ICE`
- `AZURE_STATIC_WEB_APPS_API_TOKEN_ROLLER`
- `AZURE_STORAGE_CONNECTION_STRING_ICE`
- `AZURE_STORAGE_CONNECTION_STRING_ROLLER`

No active workflow files were left under `.github/workflows` as part of Phase 5C.

## Static Output Validator

`deployment/static-azure/validate-static-output.mjs` validates an already-generated static output folder for:

- `index.html`
- `sitemap.xml`
- `robots.txt`
- expected page folders and `index.html` files
- `_next/static` assets when `_next` exists
- absence of `.env*` files
- absence of `appsettings.Development.json`
- absence of `CMS LIVE` markers
- absence of obvious secret-looking strings
- sitemap and robots canonical domain alignment
- HTML canonical link domain alignment
- no cross-domain leakage between Ice and Roller static outputs

Supported commands:

```powershell
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out
```

## Static Outputs Validated

Ice static export was rebuilt and validated:

- Command: `npm run export:static:ice`
- Site: `ice-rink-rentals`
- Domain: `iceskatingrinkrentals.com`
- Page count: `4`
- Sitemap count: `4`
- Validator result: passed
- Validator file count: `43`

Roller static export was rebuilt and validated:

- Command: `npm run export:static:roller`
- Site: `roller-rink-rentals`
- Domain: `rollerrinkrentals.com`
- Page count: `3`
- Sitemap count: `3`
- Validator result: passed
- Validator file count: `41`

## Azure Static Web Apps vs Storage

Azure Static Web Apps is the simpler first deployment path for this project because it provides a static hosting workflow, custom domain support, managed HTTPS, preview environments, and GitHub Actions integration.

Azure Storage static website hosting remains a useful lower-level option. It is simple for blob-backed static files, but custom-domain HTTPS requires an additional fronting layer such as Cloudflare, Azure CDN, or Azure Front Door.

Suggested production resource names are documented in `deployment/static-azure/azure-resource-checklist.md`.

## Cloudflare Summary

`deployment/static-azure/cloudflare-cache-rules.md` documents the intended Cloudflare posture:

- Use proxied DNS records when Cloudflare should provide CDN/WAF behavior.
- Cache immutable Next static assets aggressively.
- Keep HTML caching conservative until a purge workflow exists.
- Bypass cache for dynamic/API/admin/login/form endpoints.
- Add deployment-triggered purge later, scoped by tenant/domain.

No Cloudflare API integration or purge call was added in this phase.

## Static Form Limitation

Static export does not include live Next.js API routes. The existing runtime `/api/contact` behavior remains useful for runtime CMS preview mode, but production static hosting needs an external submission target.

The recommended launch path is a tenant-aware Azure Function or standalone Pumpkin form endpoint with server-side validation, spam protection, origin allowlists, and secret storage outside the browser.

Details are documented in `deployment/static-azure/static-form-strategy.md`.

## Secrets Policy

No real credentials, tokens, connection strings, API keys, or passwords were added. The workflow templates use placeholder GitHub secret names only, live under `deployment/static-azure/github-actions-examples/`, and are not a live deployment configuration.

The validator also checks generated static output for common forbidden files and high-confidence secret-looking strings before deployment.

## Checks Run

- `npm run export:static:ice` in `apps/ice-rink-web`: passed
- `npm run export:static:roller` in `apps/ice-rink-web`: passed
- `node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out`: passed
- `node deployment/static-azure/validate-static-output.mjs --site roller-rink-rentals --out apps/ice-rink-web/.static-artifacts/roller-rink-rentals/out`: passed
- `git diff --check`: passed
- trailing-whitespace scan for new files: passed
- targeted high-confidence secret-pattern scan for new docs/workflows: passed
- `.github/workflows` active workflow check: no workflow directory/files present from Phase 5C

## Next Recommended Phase

Phase 5D should decide the first deployment target and form endpoint strategy before live deployment work:

- choose Azure Static Web Apps or Azure Storage static website for the first production test
- create GitHub environment secret names without committing values
- implement or select the static-compatible contact form endpoint
- add deployment/purge orchestration only after the endpoint and hosting target are confirmed
