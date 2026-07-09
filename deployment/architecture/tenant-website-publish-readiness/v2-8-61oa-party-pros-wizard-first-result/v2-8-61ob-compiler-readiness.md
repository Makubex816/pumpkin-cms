# V2.8.61OB Compiler Readiness

Status: conditionally ready for compiler proof, not ready for launch.

Why compiler proof can proceed after approval:

- Source ZIP exists and is hashed.
- Secondary analyzer passed.
- Framework is high-confidence Next.js.
- Rendering mode is classified as `hybrid_next_server_required`.
- Analyzer marked `readyForCompiler: true`.
- Protected config findings count is 0.

What V2.8.61OB must handle:

- Normalize source App Router routes separately from generated `.next/server/app` HTML.
- Treat generated static HTML as passthrough candidates only after path normalization.
- Preserve catch-all source route handling.
- Build package metadata without creating a tenant.
- Build media and form manifests without upload, delete, or live POST.
- Produce validator-clean compiler output outside raw source and without staging raw uploaded content.

Required approval:

Approve a compiler-only V2.8.61OB proof for the Party Pros ZIP hash `158fbbdc12664ec258d75a021bfe198ce4169e35bfc9bccdea2e6a5bb810e5f8`, with no tenant creation, deploy, media mutation, live form submission, Airstrip mutation, keys/listKeys/SAS, or secret printing.

