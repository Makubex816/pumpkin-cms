# Source Cause Analysis

Inspected copied source only under `.tmp/v2-8-60x/`.

Relevant source:

- `.tmp/v2-8-60x/source/pumpkinairstrip/apps/airstrip-frontend/src/app/airstrip-the-club/page.tsx`
- `.tmp/v2-8-60x/source/pumpkinairstrip/apps/airstrip-frontend/src/app/globals.css`

Cause:

- `.as-club-info-grid` was defined as a 4-column grid with no mobile collapse.
- `.as-club-grid` and `.as-amen-grid` were also multi-column on the same route.
- Mobile body scroll persisted until the full club-page grid cluster was constrained and uppercase headings could wrap within their cards.

The durable source fix is a CSS overlay only. It changes layout containment, not Airstrip business content.
