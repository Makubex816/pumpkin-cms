# Next CMS Import Execution Approval Prompt

Do not use this prompt yet.

Current recommendation is CONDITIONAL GO only. CMS import execution approval is not ready until `PUMPKIN_API_URL` is present and CMS read-only current-state checks are completed with no blocking conflict.

## Required Prior Rerun Prompt

Use this first when env readiness is corrected:

```text
Approve Phase 2C-6R Roller CMS read-only preflight evidence rerun only: using environment variables already present in the shell, run presence-only checks without printing values, perform GET/HEAD-only CMS/API current-state checks for Roller tenant/site/route conflicts, summarize redacted results, and update the Phase 2C-6 evidence package. No CMS writes, no tenant creation, no MediaAsset writes, no POST/PUT/PATCH/DELETE requests, no Azure/Cloudflare/DNS/deployment/email/Search Console actions, no protected config reads, no secrets printed, and no live-page publication.
```

## Future Import Execution Prompt Template

Use this only after the read-only rerun passes:

```text
Approve Roller Rink Rentals CMS import execution only: import the validated local Roller package at <validated-package-path> into CMS draft/preview scope using validation evidence at <validation-evidence-path> and CMS read-only preflight evidence at <preflight-evidence-path>. Allowed system: CMS draft/preview scope only. Required actions: create or verify Roller tenant/site shell, import approved routes/pages/forms/SEO/theme/redirect metadata, preserve no-email form mode, preserve noindex/nofollow and disabled sitemap hard stops, capture created/updated CMS IDs, run CMS readback verification, and write redacted execution evidence at <execution-evidence-path>. Rollback owner: <rollback-owner>. Approval ID: <approval-id>. Excluded systems: MediaAsset writes, Azure, Cloudflare, DNS, deployment, Function App settings, email/Microsoft 365, Search Console/indexing, external HTTP checks except approved CMS API, protected config reads, secret printing, static generation, production readiness, and live-page publication. Hard stop immediately after CMS readback evidence.
```

## Current Status

Future CMS import execution approval is not ready today.
