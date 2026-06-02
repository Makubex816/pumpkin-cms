# Ice Local Preview Readiness

This package documents how to run and inspect the current local IceSkatingRinkRentals.com pages without importing new content or changing CMS records.

Scope:

- Primary site: IceSkatingRinkRentals.com
- Tenant/site key: `ice-rink-rentals`
- Current public app route host: `http://localhost:3002`
- CMS writes: none
- MediaAsset writes/uploads: none
- Static regeneration/deployment: none
- Email sending: none

RollerRinkRentals.com remains paused.

## What This Package Answers

- Which local services are involved.
- Which commands start them.
- Which routes can be smoke-tested safely.
- What the current page state is.
- Why the new normalized homepage candidate is not automatically visible at `/`.
- What remains before previewing the candidate through CMS or a dedicated file-preview flow.

## Key Result

The existing local apps can be started for current-page inspection, but the new normalized homepage candidate is not previewable at `/` until it is either imported into a local CMS draft with explicit authorization or connected to a dedicated preview path.

No services were listening on the expected local ports during this readiness pass.

