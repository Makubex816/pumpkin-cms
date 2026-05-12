# Ice Rink Web Homepage Render Fix Report

## Root cause

The fallback homepage `Hero` block shape was valid and the block type casing was correct, but the fallback theme had an empty `blockStyles` map. With no Pumpkin theme available, `pumpkin-block-views` used its package-level `Hero` defaults: a white-text hero intended for image or dark-background usage. Because the fallback hero had no `backgroundImage` or `mainImage`, the result was effectively white text on a white/blank hero area, with only the orange default CTA visible.

The shared `HeroBlockView` also only supports one CTA and does not render a secondary CTA or trust/support line, so the requested fallback hero content needed a small app-local enhanced hero renderer.

## Files changed

- `apps/ice-rink-web/src/data/fallback-home.ts`
  - Updated fallback hero content to the requested H1, supporting copy, primary CTA, secondary CTA, and trust/support line.
- `apps/ice-rink-web/src/data/fallback-theme.ts`
  - Added app-local fallback `Hero` style slots so fallback hero text is dark and visible on a clean sky-tinted background.
- `apps/ice-rink-web/src/components/PageRenderer.tsx`
  - Detects enhanced `Hero` content with `secondaryButtonText`, `trustLine`, or `eyebrow` and renders it with the app-local hero component.
  - Continues to render all normal CMS blocks through `BlockViewRenderer`.
- `apps/ice-rink-web/src/components/blocks/EnhancedHeroBlock.tsx`
  - Added a small app-local hero renderer for the fallback/enhanced hero shape.
  - Shared packages were not modified.

## Checks run

- `npm run lint`: passed with no warnings or errors.
- `npm run type-check`: passed.
- `npm run build`: passed.
- Runtime sanity check against `http://localhost:3002`: response HTML includes the requested hero headline, both CTA labels, and the trust/support line.

Note: running `npm run type-check` in parallel with `npm run build` can still race Next's generated `.next/types` files. A serial `npm run type-check` passes.

## Visual expectation

The fallback homepage hero should now render as a clean, mobile-first hero section with:

- H1: `Portable Ice Rink Rentals for Events`
- Supporting paragraph: `Plan portable rink rentals for events, schools, towns, corporate parties, and holiday activations with setup guidance, venue planning, and quote support.`
- Primary CTA: `Get a Quote`
- Secondary CTA: `View Rental Options`
- Trust/support line: `Event-ready portable rink planning with setup guidance and quote support`
- A visible light blue/white hero background instead of an empty white area.
- A simple planning visual panel on desktop when no CMS hero image is present.

## Remaining issues

- The app still depends on the app-local webpack alias for `pumpkin-block-views` because the shared package does not currently provide built `dist/` output.
- Some non-hero shared block defaults still use the original sample/package visual language, including orange accents. This fix intentionally stayed focused on the blank fallback hero.
- No browser screenshot file was captured; the runtime check verified the rendered HTML and the expected visual state is described above.

## Next recommended step

Seed the `ice-rink-rentals` tenant with a real `home` page and active theme, then compare CMS-rendered hero content against the fallback hero to decide whether the enhanced hero fields should remain app-local or become first-class Pumpkin CMS fields later.
