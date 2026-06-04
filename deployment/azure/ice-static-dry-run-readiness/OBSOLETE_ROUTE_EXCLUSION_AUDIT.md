# Obsolete Route Exclusion Audit

## Obsolete Ice Routes

The following routes must not be deployable in the approved Ice launch package:

- `/ice-rink-rentals`
- `/events-holiday-activations`

## Current Snapshot

CMS discovery returned obsolete slugs, but local snapshot route scoping excluded them:

- `ice-rink-rentals`
- `events-holiday-activations`

The snapshot also excluded extra non-approved slug:

- `phase-5a-csv-import-54754949`

Snapshot page files now contain only:

- `home`
- `contact`
- `service-areas`

## Theme Navigation

The fetched theme still contains obsolete navigation URLs:

- `/ice-rink-rentals`
- `/events-holiday-activations`
- `/ice-rink-rentals#faq`

It also misses `/` in primary navigation. No Theme record was changed.

## Existing Stale Output

Existing stale output remains rejected where obsolete route folders are present.

## Readiness

Obsolete route exclusion ready: no fresh static-output proof yet.

The CMS page snapshot scope is fixed locally, but theme navigation and stale output remain blockers.
