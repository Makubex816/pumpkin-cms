# Staging-First Plan

## Recommendation

Use staging domains before any live domain cutover.

Recommended staging domains:

- `ice-dev.iceskatingrinkrentals.com`
- `roller-dev.rollerrinkrentals.com`

## Why Staging First Matters

Staging lets the team validate:

- Azure hosting behavior
- static route handling
- sitemap and robots output
- canonical tags
- Cloudflare proxy/cache behavior
- form endpoint behavior
- rollback process

This catches infrastructure and content issues before production domains are touched.

## Staging Deployment Flow

1. Run `npm run publish:dry-run`.
2. Choose the dry-run release folder.
3. Upload Ice artifact to the Ice staging host.
4. Upload Roller artifact to the Roller staging host.
5. Configure staging DNS.
6. Validate routes and canonical output.
7. Validate static form behavior.
8. Record results before production cutover.

## Static Output Validation On Staging

For Ice staging:

- `/`
- `/ice-rink-rentals`
- `/events-holiday-activations`
- `/contact`
- `/sitemap.xml`
- `/robots.txt`

For Roller staging:

- `/`
- `/roller-rink-rentals`
- `/contact`
- `/sitemap.xml`
- `/robots.txt`

Confirm the staged content matches the dry-run summary.

## Form Limitation During Staging

If `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` is not configured, form submission should show the inline static endpoint error.

If a staging endpoint is configured:

- use a staging-safe endpoint
- do not send real leads to production CRM unintentionally
- allow only staging and production origins as appropriate
- keep secrets in Azure or GitHub secret storage, not repo files

## SEO, Noindex, And Canonical Caution

Staging domains should not compete with production domains.

Before staging:

- consider noindex behavior for staging host
- avoid staging sitemap submission
- confirm canonical behavior is intentional
- do not let staging pages appear as production alternatives

The current content may use production canonical URLs. That is acceptable for a short controlled staging review, but should be understood before sharing staging widely.

## What Must Pass Before Live Domains

- dry-run manifest says both sites are ready
- route checks pass
- sitemap and robots pass
- canonical tags are reviewed
- form endpoint decision is made
- Cloudflare cutover checklist is ready
- rollback artifact is saved
- Timothy approves the deployment option
