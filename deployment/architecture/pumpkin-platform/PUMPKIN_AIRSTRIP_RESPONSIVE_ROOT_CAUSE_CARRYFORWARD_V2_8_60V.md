# Pumpkin Airstrip Responsive Root Cause Carryforward V2.8.60V

Status: preserved as reusable onboarding warning pattern.

## V2.8.60R Root Cause

The active Airstrip `globals.css` missed mobile nav collapse rules that existed in the original static CSS. The active header kept the full desktop nav and CTA visible on mobile through `.as-nav-right`. Fixed or minimum-width grids and sections also lacked scoped responsive constraints.

Resulting failures before V2.8.60R:

- horizontal overflow;
- clipped request button;
- clipped hero and section content;
- sideways mobile layout.

## V2.8.60R Durable Repair Reference

Repeatable patch folder:

`deployment/airstrip/patches/v2-8-60r-mobile-responsive/`

The overlay added mobile/tablet header collapse, menu containment, responsive headings, grid collapse, global box sizing, media containment, and route-level overflow protection. V2.8.60R reported local, isolated, and production responsive proof passing 28/28 with zero overflow, console errors, failed requests, and missing images.

## Reusable Lesson

Do not hardcode Airstrip class names as global tenant rules. Instead, use Airstrip as a concrete example of these reusable onboarding checks:

- compare original/source static CSS with active converted CSS when both exist;
- confirm desktop navigation collapses or fits at mobile widths;
- confirm fixed/min-width panels, cards, info blocks, pricing sections, and grids collapse within the viewport;
- confirm CTAs remain visible and tappable;
- run browser-based overflow measurement on every selected route and viewport before cutover.

## V2.8.60V Replay Note

The new reusable checker detected mobile overflow on the current production default-host `/airstrip-the-club` route in V2.8.60V. The issue was isolated to `.as-club-info` blocks at mobile widths. Because V2.8.60V forbids source changes and deploys, this was recorded as a responsive replay blocker for a later repair phase, not repaired in this phase.
