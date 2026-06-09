# Superseded Phase 2F-5 Restore Validation Prompt

Phase 2F-5 restore validation dry-run has now been implemented in this package.

Use `NEXT_PHASE_2F6_ENCRYPTED_ESCROW_PROTOTYPE_PROMPT.md` for the next approval gate. Do not proceed to real backup export, encrypted escrow with real secrets, restore execution, CMS/API calls, deployment, external systems, or live-page publication from this superseded prompt.

## Original Prompt

Approve Phase 2F-5 local restore validation planning/prototype only: use the Phase 2F-4 hardened validator and local standard backup bundle contract to design and prototype a local-only restore validation flow that reads fake `.tmp` standard backup bundles, verifies manifest/checksum/secret-exclusion results, builds a restore plan report, and stops before any restore execution. Generated test restore-validation output may be created only under ignored `.tmp` output.

No real database restore, no real CMS/API restore, no real MediaAsset restore, no real secret export, no encrypted escrow payload, no production backup zip, no CMS/API calls, no Azure/Cloudflare/DNS/deployment/email/Search Console actions, no protected config reads, no external checks, and no live-page publication.

Required gate:

- Validate a known-good local standard backup bundle.
- Reject invalid or tampered bundles using Phase 2F-4 failure codes.
- Produce local restore validation JSON and Markdown reports.
- Confirm standard backups cannot restore secrets because escrow is not included.
- Keep all generated output under ignored `.tmp`.
- Do not proceed to real IceSkatingRinkRentals.com backup proof without separate owner approval.
