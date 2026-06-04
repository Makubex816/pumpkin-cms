# Route Expectation Repair

## Approved Ice Launch Routes

The approved Ice static launch route set is:

- `/`
- `/contact`
- `/service-areas`

The route set maps to static page slugs:

- `home`
- `contact`
- `service-areas`

## Repaired Validators

- `apps/ice-rink-web/scripts/static-publish.mjs`
- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs`
- `deployment/static-azure/scripts/static-publish-dry-run.mjs`
- `deployment/static-azure/validate-static-output.mjs`
- `deployment/static-azure/validate-staging-package.mjs`

## Obsolete Routes

The following old Ice routes were removed from required launch-route validation and are now treated as stale/obsolete if found in static content or deployable artifacts:

- `/ice-rink-rentals`
- `/events-holiday-activations`

No state/city routes were created or required.

## Documentation Updates

Static release and staging checklists now reference `/service-areas` for Ice validation instead of retired Ice routes.

