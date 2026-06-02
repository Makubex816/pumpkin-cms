# Media And Form Preview Notes

## Media

The committed media upload-selection package records:

- Official homepage PNGs were audited in the prior media pass.
- Real MediaAsset IDs bound: `0`
- MediaAsset creation attempted: no
- MediaAsset creation skipped: yes
- Blocker: authenticated admin JWT/API access was not available without reading or printing protected secrets.
- All media slots remain `mediaAssetId: null`.

Current filesystem note for this readiness pass:

- No PNG files were found under `content-review/` by `rg --files content-review -g '*.png'`.
- `content-review/ice-homepage-media-input/` was not present during this pass.
- This package did not need raw media files and did not stage or commit any binaries.

## Forms

Runtime CMS mode:

```text
Browser form -> apps/ice-rink-web /api/contact -> Pumpkin API -> FormEntry -> Lead Inbox
```

Static future mode:

```text
Static formBlock -> static form endpoint -> Pumpkin API -> FormEntry -> Lead Inbox
```

The homepage candidate preserves Pumpkin `formBlock` / `default-quote-request` intent. The static endpoint local server can run in dry-run mode, but this package did not submit a form or create a `FormEntry`.

## Email

Microsoft 365 Exchange Online Plan 1 is selected and manual mailbox verification is recorded for `contact@iceskatingrinkrentals.com`.

Pumpkin app email sending remains dry-run/not configured:

- No real SMTP or Graph send path is enabled.
- Lead notifications remain draft/dry-run only.
- Autoresponders remain draft/dry-run only.
- Public email display remains under review.

