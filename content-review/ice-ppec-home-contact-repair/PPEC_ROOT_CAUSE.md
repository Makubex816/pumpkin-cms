# PPEC Root Cause

Classification: G primary, C contributing.

Primary finding:

PPEC was not absent from the uploaded package, not normalized out, and not missing from CMS readback artifacts. It was present in the validated homepage/contact candidates and in both local draft and post-repair readbacks.

Why it looked missing locally:

- `http://localhost:3002/__preview/ice-rink-rentals/home` returns a client-side draft preview shell. The raw terminal HTTP response does not include JWT-loaded draft data, so PPEC text is absent from raw HTML.
- `http://localhost:3002/contact` is the public route, not an authenticated draft readback route. It does not prove draft contact content.
- The renderer supports `PrimaryCTA` through `PolishedPrimaryCTABlock`, so current evidence does not show a renderer type gap for the PPEC CTA.

Contributing issue:

The import preflight used a broad `/East Coast/i` check and warned on `Party Pros East Coast` even though that phrase is a partner/business name. That was a false positive and is now patched narrowly.

Rejected classifications:

- A, wrong source candidate selected: rejected. The validated package contains PPEC.
- B, reference-only content never mapped: rejected. Customer-facing PPEC blocks were mapped.
- D, normalized out: rejected. PPEC is present in normalized candidates.
- E, persisted but renderer did not render: not proven. Raw terminal HTML did not load authenticated draft data, and the renderer supports PrimaryCTA.
- F, absent from uploaded package: rejected by package inventory and candidate metadata.
