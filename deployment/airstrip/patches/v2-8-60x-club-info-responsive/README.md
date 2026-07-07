# V2.8.60X Airstrip Club Info Responsive Overlay

This overlay repairs the Airstrip `/airstrip-the-club` mobile overflow caused by the `.as-club-info-grid` staying four columns wide at mobile viewport widths.

Apply it after the V2.8.60R mobile responsive overlay:

```powershell
node deployment/airstrip/patches/v2-8-60r-mobile-responsive/apply-overlay.mjs `
  --workspace ".tmp/v2-8-60x/build-workspace/pumpkinairstrip"

node deployment/airstrip/patches/v2-8-60x-club-info-responsive/apply-overlay.mjs `
  --workspace ".tmp/v2-8-60x/build-workspace/pumpkinairstrip"
```

The script appends `overlays/apps/airstrip-frontend/src/app/v2-8-60x-club-info-responsive.css` to `apps/airstrip-frontend/src/app/globals.css` between stable V2.8.60X markers. It is idempotent and replaces any previous V2.8.60X block.

Scope:

- Collapse the neighboring `/airstrip-the-club` feature and amenity grids at mobile widths so their headings cannot keep the page body wider than the viewport.
- Collapse `.as-club-info-grid` to two columns on tablet-width viewports.
- Collapse `.as-club-info-grid` to one column on mobile viewports.
- Add min-width and wrapping constraints to `.as-club-info` text so values stay inside the viewport.

Unchanged:

- Business copy.
- Packages and pricing.
- Form fields and submission behavior.
- Media files.
- Environment or deployment configuration.
