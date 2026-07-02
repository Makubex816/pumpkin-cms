# Rendering Mode Final Decision

Decision: `hybrid-next-server-required-as-is`

Rationale:

- Source build is feasible in an isolated copied workspace after local package dependency repair.
- Static export is not feasible as-is because dynamic routes block `output: export`.
- The normalized Pumpkin package can represent pages, media, theme, forms, publish metadata, and validation expectations, but exact uploaded rendering still depends on the Next source path unless a future conversion/refactor phase replaces the app behavior.

Recommended next rendering path:

1. Use the validated normalized package for controlled tenant creation preflight only after approval.
2. Preserve hybrid/source-rendering assumptions for exact visual proof.
3. Treat static export as a future refactor lane, not the current publication path.

