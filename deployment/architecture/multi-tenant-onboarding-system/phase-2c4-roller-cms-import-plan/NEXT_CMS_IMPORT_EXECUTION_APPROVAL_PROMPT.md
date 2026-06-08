# Next CMS Import Execution Approval Prompt

Use this only after the Phase 2C-4 plan package is reviewed and remaining owner/rollback gaps are resolved or explicitly accepted.

```text
Approve Phase 2C-5 Roller CMS import execution only: import the validated local Roller package at <package path> into CMS draft/preview scope, using validation report <validation report path> and support packet <support packet path> as evidence; capture created/updated CMS IDs, run CMS readback verification, and write a redacted execution report. Allowed system: CMS draft/preview scope only. Excluded systems: MediaAsset writes, Azure, Cloudflare, DNS, deployment, Function App settings, email/Microsoft 365, Search Console/indexing, external HTTP checks, protected config reads, secrets, and live-page publication. Rollback owner: <rollback owner>. Rollback target: <rollback target>. Hard stop before static generation, production readiness, and live pages.
```

## Required Fill-Ins

- `<package path>`
- `<validation report path>`
- `<support packet path>`
- `<rollback owner>`
- `<rollback target>`

## Prompt Boundary

This future prompt would approve CMS draft/preview import execution only. It still would not approve deployment, email, Search Console, indexing, external checks, or live pages.
