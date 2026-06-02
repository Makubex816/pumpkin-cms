# Pumpkin Ice Homepage Draft Preview Support Report

Generated: 2026-06-02T20:51:54.177Z

## Scope

Implemented local draft preview support for IceSkatingRinkRentals.com and frontend media proxy support. No CMS Page, Theme, MediaAsset, contact page, service-area page, static package, deployment, DNS, email, Azure, Cloudflare, Microsoft 365, or Bluehost change was made. RollerRinkRentals.com remains paused.

## Git Status At Start

- Starting state was not clean.
- Untracked contact correction input package/extracted files were present under content-review/ice-contact-email-correction-input/.
- Those pre-existing untracked raw/input files were left untouched and unstaged.

## Recent Commits At Start

- 631c899 Add Ice homepage render diagnostic report
- c60217f Add Ice contact local draft import report
- 2d8bb45 Add Ice homepage local draft import report
- 892dccb Add Ice homepage local draft import auth blocker report
- 9b7bcad Add Ice homepage business contact policy package
- dfe4f90 Bind Ice homepage MediaAsset records
- faf5986 Add Ice homepage MediaAsset binding blocker report
- 895f914 Add safe local homepage import preflight runner
- c6e6382 Add Ice homepage local CMS preview readiness report
- 0b7345f Add Ice local preview readiness package
- 2ecd323 Update Microsoft 365 operational verification docs
- 9f31719 Record confirmed Microsoft 365 mailbox verification

## Files Changed

- apps/ice-rink-web/next.config.js
- apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/home/page.tsx
- apps/ice-rink-web/src/app/draft-preview/ice-rink-rentals/home/DraftPreviewClient.tsx
- content-review/ice-homepage-draft-preview-support/README.md
- content-review/ice-homepage-draft-preview-support/DRAFT_PREVIEW_ROUTE.md
- content-review/ice-homepage-draft-preview-support/MEDIA_PROXY_RESULT.md
- content-review/ice-homepage-draft-preview-support/PREVIEW_SECURITY_NOTES.md
- content-review/ice-homepage-draft-preview-support/HOMEPAGE_DRAFT_PREVIEW_CHECKLIST.md
- content-review/ice-homepage-draft-preview-support/manifest.json
- PUMPKIN_ICE_HOMEPAGE_DRAFT_PREVIEW_SUPPORT_REPORT.md

## Draft Preview Route

Status: implemented.

```json
{
  "requestedUrl": "http://localhost:3002/__preview/ice-rink-rentals/home",
  "validationUrl": "http://localhost:3004/__preview/ice-rink-rentals/home",
  "actualAppRoute": "/draft-preview/ice-rink-rentals/home",
  "rewriteSource": "/__preview/ice-rink-rentals/home",
  "rewriteDestination": "/draft-preview/ice-rink-rentals/home",
  "reasonForRewrite": "Next app-router folders beginning with _ are private and not routable, so __preview is supported through a rewrite to a routable internal preview path."
}
```

The actual route is under /draft-preview because Next treats app-router folders beginning with _ as private. The requested /__preview URL is supported through a rewrite.

## Public Route Result

```json
{
  "status": 200,
  "bytes": 34048,
  "hasOldTitle": true,
  "hasPreviewBanner": false,
  "hasMediaPath": false
}
```

Public / still renders the published/simple homepage and does not include the preview banner.

## Media Proxy Result

Status: implemented.

```json
{
  "status": 200,
  "contentType": "image/png",
  "length": "3607110"
}
```

The existing 3002 process also returned the media PNG through the frontend host after the rewrite was added:

```json
{
  "status": 200,
  "contentType": "image/png",
  "length": "3607110"
}
```

## Security And Indexing Guardrails

- Preview is unavailable when PUMPKIN_RENDER_MODE=static.
- Preview is unavailable in production unless PUMPKIN_DRAFT_PREVIEW_ENABLED=true or NEXT_PUBLIC_PUMPKIN_DRAFT_PREVIEW_ENABLED=true is explicitly set.
- The preview page declares noindex/nofollow/nocache metadata.
- The preview URL is not sourced from sitemap generation.
- The public / route continues to call the published/public page path and was not modified.
- The preview client requires a local admin JWT pasted at runtime or stored in browser sessionStorage; no token is committed or printed.
- The token input uses type=password and stores only in sessionStorage under pumpkin_ice_homepage_preview_jwt until cleared.
- Preview rendering passes renderMode=static with no staticFormEndpoint so form submission is inert and does not create FormEntry records from preview clicks.
- Media proxy is path-scoped to /media/ice-rink-rentals/:path* and is disabled in static mode and production unless PUMPKIN_MEDIA_PROXY_ENABLED=true.

## Local Probe Results

```json
{
  "existing3002": {
    "publicHome": {
      "status": 200,
      "bytes": 34129,
      "hasOldTitle": true,
      "hasPreviewBanner": false,
      "hasMediaPath": false
    },
    "previewBeforeServerRestart": {
      "status": 404,
      "note": "Existing 3002 process did not pick up the new route before restart."
    },
    "mediaProxy": {
      "status": 200,
      "contentType": "image/png",
      "length": "3607110"
    },
    "sitemap": {
      "status": 200,
      "includesPreview": false
    },
    "robots": {
      "status": 200,
      "includesPreview": false
    }
  },
  "validation3004": {
    "note": "A temporary hidden Next dev server was started on port 3004 because port 3002 was already occupied. It was stopped after probes and its temporary logs were removed.",
    "protectedConfigNote": "Next dev startup reported that it detected .env.local. No protected config values were opened, printed, modified, or copied by Codex.",
    "publicHome": {
      "status": 200,
      "bytes": 34048,
      "hasOldTitle": true,
      "hasPreviewBanner": false,
      "hasMediaPath": false
    },
    "previewRewrite": {
      "status": 200,
      "bytes": 27084,
      "hasPreviewBanner": true,
      "hasJwtPrompt": true,
      "hasNoindex": true,
      "hasPublicUnchangedText": true
    },
    "internalPreviewRoute": {
      "status": 200,
      "bytes": 27088,
      "hasPreviewBanner": true,
      "hasJwtPrompt": true,
      "hasNoindex": true
    },
    "mediaProxy": {
      "status": 200,
      "contentType": "image/png",
      "length": "3607110"
    },
    "sitemap": {
      "status": 200,
      "includesPreview": false,
      "includesHome": true
    }
  }
}
```

## Checks Completed

- node --check apps/ice-rink-web/next.config.js: passed
- npm run type-check from apps/ice-rink-web: passed
- JSON parse validation for manifest.json: passed
- Public / probe on 3002: passed and unchanged
- Media path probe on 3002: passed after rewrite
- Preview route probe on 3004: passed through /__preview rewrite
- Sitemap probe on 3002 and 3004: preview route absent
- git diff --check: passed
- direct trailing whitespace scan: passed
- targeted secret scan: passed
- staged file safety check: passed with 0 staged files
- protected config/generated folder status check: no protected config modifications reported
- temporary 3004 validation server stopped: confirmed no listener

## Known Limitations

- The existing localhost:3002 process returned 404 for the new preview route before restart. Restart the Ice frontend process to use the preview route on 3002.
- No admin JWT was visible to shell validation, so the probe validated the preview shell and security banner, not a live draft fetch with token.
- The preview client can fetch the live draft once a valid local admin JWT is pasted in the preview page.
- The direct internal /draft-preview/ice-rink-rentals/home path is routable because /__preview is implemented as a rewrite; both are noindex and excluded from sitemap.

## Next Recommended Action

- Restart the Ice frontend process on port 3002 so next.config.js and the new app route are active there.
- Open http://localhost:3002/__preview/ice-rink-rentals/home after restart.
- Paste the local admin JWT into the preview page and load the draft.
- Review the rendered draft media and layout; public http://localhost:3002/ remains published-only.

## Expected Final State

- Ready for local draft preview after the Ice frontend process is restarted on port 3002 and a valid admin JWT is supplied in the preview page.
- Ready for public / route: unchanged and published-only.
- Ready for local media preview: yes, /media/ice-rink-rentals paths proxy through the frontend.
- Ready for production/indexing/static export: no.
- Ready for CMS publication: no, this run did not approve or publish content.
