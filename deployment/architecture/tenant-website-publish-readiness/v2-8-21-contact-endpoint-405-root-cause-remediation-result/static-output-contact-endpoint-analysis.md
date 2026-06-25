# Static Output Contact Endpoint Analysis

Result: selected production artifact has no deployed contact endpoint.

Selected production artifact:

- `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260625063439/repo/apps/ice-rink-web/out`

Artifact evidence:

- Top-level routes present: `/`, `/contact`, `/service-areas`, `/404`.
- `out/api` directory: absent.
- `contact/index.html`: present.
- `contact/index.txt`: present.
- `static-publish-manifest.json`: present.

Contact payload extraction:

- `renderMode` was `static`.
- `staticFormEndpoint` was present but empty.
- `/api/contact` was not present in `contact/index.txt`.
- `/api/static-contact` was not present in `contact/index.txt`.
- `contact@iceskatingrinkrentals.com` was present.

Build shape:

- `next.config.js` uses `output: 'export'` when `PUMPKIN_RENDER_MODE=static`.
- Next static export does not emit App Router API routes into `out`.

Conclusion:

- The selected production static artifact cannot serve `/api/contact` itself.
- The artifact also did not tell the browser to use a separate static endpoint.
