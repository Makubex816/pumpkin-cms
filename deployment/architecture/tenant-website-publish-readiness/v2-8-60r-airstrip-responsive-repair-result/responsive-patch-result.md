# Responsive Patch Result

Status: passed.

Durable overlay files:

- `deployment/airstrip/patches/v2-8-60r-mobile-responsive/README.md`
- `deployment/airstrip/patches/v2-8-60r-mobile-responsive/apply-overlay.mjs`
- `deployment/airstrip/patches/v2-8-60r-mobile-responsive/overlays/apps/airstrip-frontend/src/app/v2-8-60r-responsive.css`

Apply command:

```powershell
node deployment/airstrip/patches/v2-8-60r-mobile-responsive/apply-overlay.mjs `
  --workspace ".tmp/v2-8-60r/build-workspace/pumpkinairstrip"
```

Patch behavior:

- Appends the overlay to `apps/airstrip-frontend/src/app/globals.css` between stable V2.8.60R markers.
- Idempotently replaces any previous V2.8.60R block.
- Changes only text source in a copied workspace.

Responsive repair scope:

- Header/nav mobile and tablet containment.
- Mobile menu viewport containment.
- Tappable Request Booking CTA in mobile menu.
- Responsive hero/page heading sizing.
- Responsive grid collapse for mobile-hostile sections.
- Box sizing and media max-width containment.

Unchanged:

- Business copy.
- Packages and pricing.
- Form fields and submission logic.
- Media assets.
- Environment configuration.
- DNS/custom-domain/indexing behavior.
