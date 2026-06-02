# Ice Homepage Local CMS Preview

This package records the local health check, homepage candidate validation, and CMS import decision for the IceSkatingRinkRentals.com homepage.

Scope:

- Homepage only.
- Tenant/site key: `ice-rink-rentals`
- Candidate route: `/`
- CMS import/update: skipped.
- Contact page: untouched.
- Service areas page: untouched.
- Roller: paused.

## Result

Local API, admin, and Ice public frontend services were running. Safe route checks succeeded for API, admin, `/`, and `/contact`; `/service-areas` returned 404, matching the current hold/fallback state.

The best homepage candidate validated offline, but import was not performed because the admin import/export preflight was not available as a non-secret CLI/auth-free step and the candidate still has unresolved MediaAsset/business/approval blockers.

## Selected Candidate

```text
content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json
```

## Local Preview URL

Current live local route:

```text
http://localhost:3002/
```

This URL currently shows the existing local/CMS/fallback homepage, not the new candidate, because the candidate was not imported.

