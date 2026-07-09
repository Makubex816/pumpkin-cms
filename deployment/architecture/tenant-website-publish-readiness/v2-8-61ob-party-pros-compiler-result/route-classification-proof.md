# Route Classification Proof

Status: route classification generated.

Counts:

- Analyzer-discovered route candidates: 398.
- Route classifications in compiled output: 400.
- Compiler-synthesized V1 baseline routes: 2.
- Expected non-dynamic GET routes: 397.
- Dynamic route classifications: 3.

Classification groups:

- `runtime_route`: 393.
- `dynamic_route`: 3.
- `compiled_page`: 2.
- `owner_review_required`: 2.

Interpretation:

All 398 analyzer-discovered route candidates were preserved through classification. The compiler added `/contact` and `/service-areas` baseline records for V1 validator compatibility because the generated HTML routes from `.next/server/app` include package-root-prefixed paths. Dynamic catch-all routes remain runtime-handled and are excluded from expected GET route validation.

Important compiler gap:

V2.8.61OC or a future compiler hardening phase must normalize generated `.next/server/app` route paths into public Party Pros URLs before any tenant import or preview approval.

