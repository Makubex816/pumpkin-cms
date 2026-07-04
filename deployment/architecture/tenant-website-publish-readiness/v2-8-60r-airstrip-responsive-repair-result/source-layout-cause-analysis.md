# Source Layout Cause Analysis

Status: cause identified.

Source handling:

- Original ZIP was not modified.
- Normalized package was not modified.
- ZIP was extracted only into `.tmp/v2-8-60r/source/`.
- Build work happened only in `.tmp/v2-8-60r/build-workspace/`.

Primary cause:

- `apps/airstrip-frontend/src/app/globals.css` had Airstrip nav classes but did not include the mobile collapse rules present in the static `public/assets/css/site.css`.
- `apps/airstrip-frontend/src/components/AirstripHeader.tsx` rendered desktop links and the Request Booking CTA as direct children of `.as-nav-right`.
- Without active mobile CSS, `.as-nav-right` stayed wide on mobile and caused page-level horizontal overflow.

Additional responsive risks:

- `.as-why-grid` used `minmax(0, 500px) minmax(360px, 454px)` plus an 80 px gap.
- Several package/group grids used fixed multi-column templates.
- Hero and page headings used large fixed sizes without a mobile clamp in the active stylesheet.

Decision:

- Use a scoped CSS overlay rather than a broad component rewrite.
- Keep visual brand, copy, media, packages, pricing, and form fields unchanged.
