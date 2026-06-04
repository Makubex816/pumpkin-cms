# Stale Artifact Policy

## Stale Artifact Definition

For Ice static readiness, an artifact is stale if it:

- omits `/service-areas`
- still includes deployable `/ice-rink-rentals`
- still includes deployable `/events-holiday-activations`
- has a static publish manifest missing `service-areas`
- has a static publish manifest containing obsolete Ice page slugs
- was generated from old seed/snapshot content instead of the current approved live CMS route set

## Validator Behavior

CMS snapshot validation now fails if the current Ice snapshot is missing `service-areas` or includes obsolete Ice slugs.

Static publish validation now fails if static content is missing approved Ice slugs or includes obsolete Ice slugs.

Static output and staging package validators now fail if old route folders are deployable or if `service-areas/index.html` is missing.

## Cleanup Policy

This run did not delete generated artifacts. Safe cleanup may be performed in a later task after confirming the target paths are ignored generated folders:

- `apps/ice-rink-web/.static-content-snapshots/ice-rink-rentals/`
- `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/`
- `apps/ice-rink-web/out/`
- `.static-release-dry-runs/`

Cleanup is not required for safety because validators now block stale artifacts from passing.

