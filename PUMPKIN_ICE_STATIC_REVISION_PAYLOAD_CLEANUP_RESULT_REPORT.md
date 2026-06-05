# Pumpkin Ice Static Revision Payload Cleanup Result Report

Date: 2026-06-05

Branch: feature/admin-page-editor-import-export

Primary site: IceSkatingRinkRentals.com

Paused site: RollerRinkRentals.com

## Goal

Repair only the Ice public static export path so stale local `/media/...` strings in serialized `revision.latestSnapshot` rollback payloads no longer appear in public static artifacts or fail media validators.

## Result

Completed within the approved local tooling/static export scope.

Changed:

```text
apps/ice-rink-web/scripts/snapshot-cms-content.mjs
```

The snapshot writer now strips `revision.latestSnapshot` from Ice public static page snapshots before writing `.static-content-snapshots/ice-rink-rentals/pages/*.json`. Active page content, SEO/meta fields, root media fields, route filtering, theme snapshot behavior, and validators remain intact.

No CMS writes, page/body edits, stale CMS revision writes, MediaAsset writes, theme/navigation edits, form endpoint work, Cloudflare/Azure changes, deployment, email/Microsoft 365 work, raw image staging, protected config reads, secret printing, or Roller work occurred.

## Diagnosis

The stale strings were serialized admin rollback data:

```text
page.revision.latestSnapshot.page.ContentData...
page.revision.latestSnapshot.page.media...
```

`PageRenderer` is a client component, so passing the full static page object caused the rollback payload to be serialized into public static output. Public rendering did not require `revision.latestSnapshot`, so omission was safer than CMS revision writes or validator weakening.

## Static Export And Validators

`npm run export:static:ice:cms` exited `0`.

Approved page routes remain:

```text
/
/contact
/service-areas
```

Post-cleanup scan:

| Check | Result |
| --- | ---: |
| local `/media/ice-rink-rentals/...` strings in text export output | 0 |
| `revision.latestSnapshot` mentions in text export output | 0 |
| rendered local `<img src="/media/...">` occurrences | 0 |
| preview/obsolete deployable paths | 0 |

Validators:

| Validator | Exit | Result |
| --- | ---: | --- |
| `npm run validate:snapshot:ice` | 0 | passed with non-media warnings |
| strict static output validator | 1 | fails only on missing/unverified static form endpoint |
| strict staging package validator | 1 | fails only on missing/unverified static form endpoint |

## Readiness

| Gate | Status |
| --- | --- |
| static dry run completed | yes |
| static route output ready | yes |
| Azure media files uploaded | yes |
| Azure direct public Blob media readable | yes |
| Cloudflare Worker media delivery configured | yes |
| Cloudflare public media URLs validated | yes |
| MediaAsset production URL readiness | yes |
| active page body media URL readiness | yes |
| revision payload local media cleanup | yes |
| media production URL readiness | yes |
| static output quality gates | no |
| contact form production readiness | no |
| Azure staging readiness | no |
| DNS cutover readiness | no |
| production/indexing readiness | not live-ready |
| Roller | paused |

## Result Package

Created:

```text
deployment/azure/ice-static-revision-payload-cleanup-result/
```

