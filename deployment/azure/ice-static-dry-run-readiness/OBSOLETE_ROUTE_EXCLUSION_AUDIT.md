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

Snapshot page files contain only:

- `home`
- `contact`
- `service-areas`

## Theme Navigation

The fetched active theme contains obsolete navigation URLs:

- `/ice-rink-rentals`
- `/events-holiday-activations`
- `/ice-rink-rentals#faq`

It also misses `/` in primary navigation. No Theme record was changed.

For local route-shape proof only, the snapshot copy of `theme.menu` is scoped to:

- `/`
- `/contact`
- `/service-areas`

Recommended CMS/theme change: update the active theme menu to the approved production routes only.

## Fresh Static Output

Fresh output route checks found no deployable obsolete route folders in either `out` or the copied artifact.

Obsolete route exclusion ready for local route-shape proof: yes.
