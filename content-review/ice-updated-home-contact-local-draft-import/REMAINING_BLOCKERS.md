# Remaining Blockers

Run blockers:

These are readback persistence mismatches after successful local CMS writes.

- Homepage required MediaAsset IDs missing from page.
- Production-render fields did not persist.
- Selected mailbox missing.
- Public email display policy mismatch.

Warnings:

- Requested custom changeSource did not persist exactly; current API normalized it. reviewMetadata.localDraftImport records the requested source.

Before static regeneration:

- Manual browser preview review is still required.
- Static regeneration must be separately authorized.
- Pages remain draft/needs_review with production and publish approval false.

Before production/indexing:

- Human production approval is still required.
- Publishing/indexing/deploy work must be separately authorized.
- DNS, email/provider, Azure, Cloudflare, Bluehost, and Roller work remain out of scope.
