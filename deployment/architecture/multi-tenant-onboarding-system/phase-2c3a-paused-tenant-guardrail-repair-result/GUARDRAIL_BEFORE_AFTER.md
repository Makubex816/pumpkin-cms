# Guardrail Before And After

## Before

The builder and validator treated any Roller text as a paused-tenant reference.

Default blocked examples:

- `roller-rink-rentals`
- `Roller Rink Rentals`
- `rollerrinkrentals.com`

That was safe by default, but it could not distinguish accidental paused-tenant leakage from the user-approved local/offline Roller dry run.

## After

Paused tenant references still fail by default.

Roller is allowed only when all of these are true:

- tenant slug is `roller-rink-rentals`
- primary domain is `rollerrinkrentals.com`
- approval scope is `local-offline-dry-run-only`
- external mutations are disallowed
- live pages are not approved
- live pages are explicitly hard-stopped
- Search Console is not approved
- Search Console/indexing is explicitly hard-stopped
- owner approval marker is true
- generator mode is `offline-local-only`
- robots are `noindex,nofollow`
- sitemap is disabled until final gate
- indexing final gate approval is `blocked-until-final-review`

## Files Changed

- Builder answers validator validates the explicit approval object.
- Builder package generator writes approval metadata into the generated manifest.
- Validator accepts paused Roller references only when generated manifest/site/seo/tenant metadata proves the same local-only approval.
- Manifest schema now permits the exact `pausedTenantDryRunApproval` object.

## Preserved Blocks

The repair does not authorize CMS import, tenant creation, deployment, live pages, Search Console, indexing, email, external checks, or protected config access.
