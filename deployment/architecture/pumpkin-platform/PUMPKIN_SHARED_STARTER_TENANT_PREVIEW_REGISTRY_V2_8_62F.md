# Pumpkin Shared Starter Tenant Preview Registry V2.8.62F

The shared starter may host multiple package-static tenant previews through a generated registry without adding tenant-specific route branches to application code.

## Registry Contract

- Each entry identifies tenant ID, fixture path, render mode, schema version, fixture hash, route inventory, and redirect contracts.
- Registry generation is deterministic and fails on duplicate tenant IDs, invalid fixtures, unsafe paths, or inconsistent hashes.
- Application loaders support established fixture types without changing another tenant identity or semantics.

## Routing Contract

- Serve previews only under `/preview/{tenantId}` unless a later phase explicitly approves custom-host routing.
- Resolve tenant-scoped redirects before page rendering and preserve approved status/query behavior while rejecting loops.
- Rewrite internal links within the preview namespace; never expose previews in public starter navigation or sitemap.
- Send `X-Robots-Tag: noindex, nofollow, noarchive` and suppress public canonical emission.
