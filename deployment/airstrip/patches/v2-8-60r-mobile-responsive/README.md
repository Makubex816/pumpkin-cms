# V2.8.60R Airstrip Mobile Responsive Overlay

This overlay repairs mobile and tablet layout overflow in the Airstrip Next.js source package without modifying the original ZIP or normalized tenant package.

Apply it to a copied extraction of `pumpkinairstrip.zip`:

```powershell
node deployment/airstrip/patches/v2-8-60r-mobile-responsive/apply-overlay.mjs `
  --workspace ".tmp/v2-8-60r/build-workspace/pumpkinairstrip"
```

The script appends the CSS from `overlays/apps/airstrip-frontend/src/app/v2-8-60r-responsive.css` to `apps/airstrip-frontend/src/app/globals.css` between stable markers. It is idempotent and replaces any previous V2.8.60R block.

Scope:

- mobile/tablet header collapse and menu containment;
- responsive hero/page headings;
- mobile/tablet grid collapse for sections that had fixed columns or minimum widths;
- global box sizing and media containment.

The overlay does not change business copy, pricing, package data, form fields, media assets, environment configuration, secrets, DNS, custom-domain binding, indexing, or CMS content.
