# Remaining Blockers

## Before Local CMS Draft Import

- Admin import/export preflight must run and show no blocking errors.
- Explicit authorization is needed for any local CMS draft write.
- Decide whether a draft preview may proceed with `mediaAssetId: null` placeholders.
- If not, create/select real Ice tenant MediaAsset records first.
- Confirm homepage should remain `isPublished: false` and workflow status draft/needs-review.

## Before CMS Import Readiness

- Real tenant-scoped MediaAsset records and IDs.
- Public media URLs/thumbnail URLs from the actual storage pipeline.
- Public phone/email display policy.
- Legal/business display name.
- Primary service-area wording.
- Human approval for homepage copy, media, SEO, schema, and form behavior.
- Admin import/export preflight.

## Before Static Regeneration

- Approved CMS homepage draft/import.
- Route `/` verified locally after import.
- Contact/service-area hold decision documented.
- Static snapshot/export source chosen.
- Static package validation.

## Before Production

- All local draft/CMS/static blockers resolved.
- Production media URLs verified.
- Form behavior smoke-tested through approved dry-run/controlled path.
- Microsoft 365/Pumpkin app sending decision remains separate; Pumpkin real email sending is not ready.
- DNS, Azure, Cloudflare, deployment, and production indexing approvals.

