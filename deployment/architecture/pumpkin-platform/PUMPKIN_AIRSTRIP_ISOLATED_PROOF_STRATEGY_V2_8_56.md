# Pumpkin Airstrip Isolated Proof Strategy V2.8.56

Status: `hybrid_proof_required`

Rendering decision:

`hybrid-next-server-required-as-is`

Proof strategy:

1. Treat the validated normalized package as the data/contract artifact for a later controlled tenant preflight.
2. Treat exact visual parity as a source-rendered Next proof unless a later source refactor removes dynamic routes.
3. Do not rely on static export for this upload as-is.
4. Keep media upload, tenant creation, deploy, DNS, indexing, contact POST, and form submission in separate explicitly approved phases.

Static export blocker:

The copied-workspace static export adapter failed because `/sitemap.xml` is marked dynamic. The catch-all route is also dynamic and would require static generation planning before an export-only publish path.

