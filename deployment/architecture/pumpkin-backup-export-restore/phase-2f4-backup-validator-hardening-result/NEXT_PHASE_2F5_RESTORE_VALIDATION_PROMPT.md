# Next Phase 2F-5 Restore Validation Prompt

Approve Phase 2F-5 local restore validation planning/prototype only: use the Phase 2F-4 hardened validator and local standard backup bundle contract to design and prototype a local-only restore validation flow that reads fake `.tmp` standard backup bundles, verifies manifest/checksum/secret-exclusion results, builds a restore plan report, and stops before any restore execution. Generated test restore-validation output may be created only under ignored `.tmp` output.

No real database restore, no real CMS/API restore, no real MediaAsset restore, no real secret export, no encrypted escrow payload, no production backup zip, no CMS/API calls, no Azure/Cloudflare/DNS/deployment/email/Search Console actions, no protected config reads, no external checks, and no live-page publication.
