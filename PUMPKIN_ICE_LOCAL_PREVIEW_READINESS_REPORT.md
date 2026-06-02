# Pumpkin Ice Local Preview Readiness Report

## Scope

This report documents local runtime preview readiness for the current IceSkatingRinkRentals.com pages without importing new content, updating CMS Page records, updating CMS Theme records, creating MediaAssets, regenerating static packages, deploying, sending email, changing DNS, or reading protected config.

RollerRinkRentals.com remains paused.

## Git Status At Start

`git status --short` returned no output. The working tree was clean.

Latest commits reviewed:

```text
2ecd323 Update Microsoft 365 operational verification docs
9f31719 Record confirmed Microsoft 365 mailbox verification
10393b7 Add Microsoft 365 operational email verification package
5f86906 Add Microsoft 365 email provider selection readiness
218f4ca Select Microsoft 365 Exchange Online for Ice email readiness
3792044 Update Ice homepage media upload selection manifest
910971c Add email infrastructure readiness system
3526250 Add Ice import readiness input request package
bbf848f Add Ice homepage media upload selection manifest
52d4c9c Add Phase 8C.14B page intake normalizer
7b6c7fe Add Phase 8C.15 Ice homepage media binding manifest
cb3e6fb Add Phase 8C.14 Ice homepage media intake validation
```

## Services Reviewed

| Service | Folder | Command | Expected URL | Purpose |
| --- | --- | --- | --- | --- |
| Pumpkin API | `apps/pumpkin-api` | `dotnet run` | `http://localhost:5064` | CMS API, pages, themes, forms, admin endpoints, MediaAssets |
| Admin app | `apps/admin` | `npm run dev` | `http://localhost:3000` | Authenticated CMS admin, import/export, media, Lead Inbox |
| Ice public app | `apps/ice-rink-web` | `npm run dev` | `http://localhost:3002` | Public Ice page renderer |
| Static form endpoint | `deployment/static-azure/forms/static-form-endpoint` | `npm run start:local` | `http://localhost:7072/api/contact` | Local static form endpoint foundation |

Pumpkin API launch settings bind the HTTP profile to `http://localhost:5064`. The API project currently targets `net10.0`.

## Safe Runtime Checks

Non-mutating HTTP probes were attempted:

| Target | URL | Method | Result |
| --- | --- | --- | --- |
| Pumpkin API root | `http://localhost:5064/` | GET | timed out |
| Admin app root | `http://localhost:3000/` | GET | timed out |
| Ice public home | `http://localhost:3002/` | GET | timed out |
| Ice public contact | `http://localhost:3002/contact` | GET | timed out |
| Ice public service areas | `http://localhost:3002/service-areas` | GET | timed out |
| Static form endpoint | `http://localhost:7072/api/contact` | GET | timed out |

Listener check result:

| Port | Service | Listener |
| ---: | --- | --- |
| 5064 | Pumpkin API | no listener |
| 3000 | Admin app | no listener |
| 3002 | Ice public app | no listener |
| 7072 | Static form endpoint | no listener |

No login, token-bearing request, form submission, CMS write, MediaAsset upload, DNS change, email action, or deployment action was performed.

## Routes To Preview

- `/`: `http://localhost:3002/`
- `/contact`: `http://localhost:3002/contact`
- `/service-areas`: `http://localhost:3002/service-areas`

Current expected behavior:

- `/` renders current CMS home when API/content credentials are available, otherwise Ice fallback home.
- `/contact` renders current CMS contact when available, otherwise Ice fallback contact.
- `/service-areas` depends on CMS content. No fallback `service-areas` page was found in the public app fallback pages.

## Current Page State

Best current homepage candidate:

```text
content-review/ice-homepage-phase8c14b-normalized/proposed-homepage.normalizer-verified.json
```

Media-selected candidate:

```text
content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json
```

The homepage candidate is .NET Page-contract valid with review/media warnings, but it is not CMS-import-ready. Contact and service-area pages remain on hold.

## Candidate Previewability

The new normalized homepage candidate is not previewable at `http://localhost:3002/` without additional work.

Reason:

- Runtime mode fetches CMS pages through Pumpkin API.
- Static mode loads from configured static content sources.
- No existing route/tool was found that directly renders arbitrary `content-review` candidate JSON in the public app.
- Admin preview links are route-based and target existing page records.

Preview options later:

- Import the candidate as a local CMS draft only after explicit authorization and dry-run preflight.
- Or add a dedicated file-based preview path that renders approved candidate JSON without saving it to CMS.

## Media Binding Status

Existing media upload-selection package result:

- Real MediaAsset IDs bound: `0`
- MediaAsset records created: none
- Upload attempted: no
- Upload skipped reason: authenticated admin JWT/API access was not available without protected secrets.
- Current homepage media references remain `mediaAssetId: null`.

Current filesystem note:

- No PNG files were found under `content-review/` during this pass.
- `content-review/ice-homepage-media-input/` was not present during this pass.
- No raw media binaries were staged or committed.

## Forms And Lead Inbox

Runtime CMS form flow remains:

```text
Browser form -> apps/ice-rink-web /api/contact -> Pumpkin API -> FormEntry -> Lead Inbox
```

Static future form flow remains:

```text
Static formBlock -> static form endpoint -> Pumpkin API -> FormEntry -> Lead Inbox
```

No form submission was performed. No `FormEntry` was created.

## Microsoft 365 Status Summary

Existing reports record:

- Microsoft 365 Exchange Online Plan 1 is selected for Ice.
- Manual mailbox verification for `contact@iceskatingrinkrentals.com` is confirmed.
- Pumpkin app email sending remains dry-run/not configured.
- No real SMTP or Graph send path is enabled.
- Public email display remains under review.

No Microsoft 365, DNS, Bluehost, Cloudflare, Azure, or email sending action was performed in this package.

## Output Files Created

- `content-review/ice-local-preview-readiness/README.md`
- `content-review/ice-local-preview-readiness/LOCAL_SERVICES.md`
- `content-review/ice-local-preview-readiness/START_COMMANDS.md`
- `content-review/ice-local-preview-readiness/ROUTE_PREVIEW_CHECKLIST.md`
- `content-review/ice-local-preview-readiness/CURRENT_PAGE_STATE.md`
- `content-review/ice-local-preview-readiness/HOMEPAGE_CANDIDATE_PREVIEW_GAP.md`
- `content-review/ice-local-preview-readiness/MEDIA_AND_FORM_PREVIEW_NOTES.md`
- `content-review/ice-local-preview-readiness/NEXT_ACTION_CHECKLIST.md`
- `content-review/ice-local-preview-readiness/manifest.json`
- `PUMPKIN_ICE_LOCAL_PREVIEW_READINESS_REPORT.md`

## Blockers To Previewing The New Homepage Candidate

- No direct public app file-preview route for the normalized candidate JSON.
- Candidate has not been imported into local CMS draft.
- Real MediaAsset IDs are still unbound.
- Business/public contact values and service-area wording remain unresolved.
- Human approval and admin import/export preflight are not complete.

## Readiness Classification

- Ready for human review: yes.
- Ready for current local app startup/inspection: yes, once services are manually started.
- Ready to preview current CMS/fallback pages: yes, once services and local config are available.
- Ready to preview the new normalized homepage candidate without CMS import: no.
- Ready for CMS import: no.
- Ready for local CMS draft import: maybe later, only with explicit authorization and preflight.
- Ready for static regeneration: no.
- Ready for production/indexing: no.

## Checks Run

- `git status --short` at start: clean.
- Raw PNG search for this pass: no PNG files found under `content-review/`; no raw media was staged.
- Non-mutating HTTP probes: attempted for API, admin, Ice routes, and static form endpoint; all timed out because no expected ports had listeners.
- Local listener check: no listeners on `5064`, `3000`, `3002`, or `7072`.
- JSON parse validation: passed for `content-review/ice-local-preview-readiness/manifest.json`.
- `git diff --check`: passed.
- Direct trailing whitespace scan over changed files: passed.
- Protected config/workflow/generated/raw-media path check over changed files: passed.
- Targeted high-confidence secret scan over changed files: passed.
- Staged-file guard: passed; no files staged.
- No ZIPs staged: passed.
- No raw media binaries staged: passed.
- No generated static folders staged: passed.
- No protected config modified: passed.
- `node --check`: not applicable; no `.js` or `.mjs` files changed.
- TypeScript type-check: not applicable; no TypeScript code changed.
- `dotnet build`: not applicable; no .NET code changed.

## Known Limitations

- This package did not start services; it only documented commands and checked current listener/runtime state.
- The public app cannot render the new homepage candidate at `/` without CMS import or a new file-preview path.
- Current route inspection still depends on local runtime config, local database availability, and whether CMS records exist.
- Functional form submission was not tested.
- MediaAsset upload/selection remains blocked until an authenticated local admin session is available without reading or printing protected secrets.

## Next Recommended Action

Start the API and Ice public app locally, then inspect the current `/`, `/contact`, and `/service-areas` behavior. After that, decide whether the new homepage candidate should be previewed through a dedicated file-preview flow or through an explicitly authorized local CMS draft import.

## No-Go Confirmations

- No CMS Page records changed.
- No CMS Theme records changed.
- No MediaAsset records created.
- No raw media files staged.
- No generated static package regenerated.
- No deployment performed.
- No Azure, Cloudflare, Bluehost, DNS, or Microsoft 365 action performed.
- No real email sent.
- No protected config read or modified.
- No GitHub workflow created.
- Roller remains paused.
