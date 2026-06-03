# PPEC Logo Contrast Fix

## Files Changed

- `apps/ice-rink-web/src/components/blocks/PolishedBlocks.tsx`
- `apps/ice-rink-web/src/app/globals.css`

## Renderer Update

Added an inner logo container:

- `ppec-partner-logo-well`

The PPEC logo card structure is now:

- `ppec-partner-card`
- `ppec-partner-logo-wrap`
- `ppec-partner-logo-well`
- `ppec-partner-logo`

## CSS Update

The outer logo card remains soft/light:

- `ppec-partner-logo-wrap` keeps a white/lavender card treatment.

The new inner well provides contrast:

- `ppec-partner-logo-well` uses `bg-violet-950`.
- The well has rounded corners, a subtle border, inner shadow, and padding.
- The logo remains `object-contain` with `max-h-24`, `max-w-xs`, and full-width containment.

This fixes the white/transparent logo on white-card problem without altering the logo image or CMS data.

## Guardrails

- CMS writes occurred: no.
- MediaAsset changes occurred: no.
- Image generation occurred: no.
- Image editing occurred: no.
- Static generation occurred: no.
- Deployment/provider changes occurred: no.
- Roller touched: no.

