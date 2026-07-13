# Tenant Runtime Fixture Source of Truth Standard V2.8.62FRR

A shared starter runtime fixture must be either:

1. deterministically generated from complete committed authoritative inputs; or
2. a verified immutable fixture committed as the accepted runtime source.

External-only operator paths are evidence, not deployable dependencies. Import requires an independent full hash, identity/count reconciliation, protected-content scan, and owner-accepted behavior match. The source evidence must be copied, never moved or deleted.

Clean-room proof must materialize immutable artifacts from committed blobs and rebuild local package output from tracked source. Pre-existing workspace `dist`, `.next`, temporary fixtures, screenshots, and deployment packages are prohibited inputs.
