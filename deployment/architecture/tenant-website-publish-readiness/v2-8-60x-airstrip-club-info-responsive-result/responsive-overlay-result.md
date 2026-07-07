# Responsive Overlay Result

Status: passed.

Created:

- `deployment/airstrip/patches/v2-8-60x-club-info-responsive/README.md`
- `deployment/airstrip/patches/v2-8-60x-club-info-responsive/apply-overlay.mjs`
- `deployment/airstrip/patches/v2-8-60x-club-info-responsive/overlays/apps/airstrip-frontend/src/app/v2-8-60x-club-info-responsive.css`

Apply order:

1. V2.8.60R overlay.
2. V2.8.60X overlay.

Overlay behavior:

- Adds stable V2.8.60X markers to copied-workspace `globals.css`.
- Collapses `.as-club-info-grid` to two columns on tablet and one column on mobile.
- Collapses `.as-club-grid` and `.as-amen-grid` to avoid mobile body overflow on `/airstrip-the-club`.
- Adds `min-width: 0` and wrapping constraints for club page card/info content.

Unchanged:

- Business copy.
- Packages and pricing.
- Forms and form submission behavior.
- Phone numbers.
- Media files.
- Environment or deployment configuration.
