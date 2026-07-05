# Airstrip Responsive Root Cause Carryforward

Airstrip is now documented as a reusable warning pattern, not a universal class-name rule.

Reusable lessons:

- Compare original/source CSS with active converted CSS when both exist.
- Confirm desktop navigation collapses or fits at mobile widths.
- Confirm CTAs remain visible and tappable.
- Confirm fixed/min-width cards, grids, panels, and repeated info blocks collapse within viewport.
- Confirm images and media are bounded with responsive constraints.
- Run browser-level horizontal overflow checks before production/cutover approvals.

The V2.8.60R overlay remains the concrete reference:

`deployment/airstrip/patches/v2-8-60r-mobile-responsive/`

V2.8.60V replay note: the new checker found current mobile overflow on `/airstrip-the-club` from `.as-club-info` blocks at mobile viewport widths. This phase recorded the blocker only.
