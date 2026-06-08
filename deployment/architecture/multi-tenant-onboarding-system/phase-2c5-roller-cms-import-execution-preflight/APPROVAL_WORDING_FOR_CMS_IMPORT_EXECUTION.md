# Approval Wording For CMS Import Execution

This wording is for a later approval only. It must not be used until the CMS read-only preflight has passed and the operator is ready to approve CMS draft/preview import execution.

## Required Later Approval Prompt

```text
Approve Roller Rink Rentals CMS import execution only: import the validated local Roller package at <validated-package-path> into CMS draft/preview scope using validation evidence at <validation-evidence-path> and CMS read-only preflight evidence at <preflight-evidence-path>. Allowed system: CMS draft/preview scope only. Required actions: create or verify Roller tenant/site shell, import approved routes/pages/forms/SEO/theme/redirect metadata, preserve no-email form mode, preserve noindex/nofollow and disabled sitemap hard stops, capture created/updated CMS IDs, run CMS readback verification, and write redacted execution evidence at <execution-evidence-path>. Rollback owner: <rollback-owner>. Approval ID: <approval-id>. Excluded systems: MediaAsset writes, Azure, Cloudflare, DNS, deployment, Function App settings, email/Microsoft 365, Search Console/indexing, external HTTP checks, protected config reads, secret printing, static generation, production readiness, and live-page publication. Hard stop immediately after CMS readback evidence.
```

## Required Filled Fields

- `<validated-package-path>`
- `<validation-evidence-path>`
- `<preflight-evidence-path>`
- `<execution-evidence-path>`
- `<rollback-owner>`
- `<approval-id>`

## Invalid Approval Examples

- Approval that says only "import Roller" without package path and scope.
- Approval that includes deployment, DNS, or live pages.
- Approval that allows email delivery changes.
- Approval that allows MediaAsset writes.
- Approval that allows Search Console or indexing.
- Approval that does not name rollback owner.
- Approval that asks to read protected config or print secrets.

## Current Status

This approval has not been granted. Phase 2C-5 only prepares the wording.
