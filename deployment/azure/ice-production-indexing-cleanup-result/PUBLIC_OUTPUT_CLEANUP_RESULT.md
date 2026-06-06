# Public Output Cleanup Result

Generated: 2026-06-06

## Cleanup Performed

Added `apps/ice-rink-web/src/lib/public-render-page.ts` to build a public render copy of a CMS page before it crosses into the client-rendered `PageRenderer`.

Updated:

- `apps/ice-rink-web/src/app/page.tsx`
- `apps/ice-rink-web/src/app/[...slug]/page.tsx`
- `apps/ice-rink-web/src/components/PageRenderer.tsx`
- `apps/ice-rink-web/scripts/static-publish.mjs`

The server-side `StructuredData` component still receives the full page object. The client renderer receives the sanitized public page object.

## Omitted Public Payload Fields

The public client payload now strips admin/review/source fields including:

`blockingIssues`, `deploymentHooks`, `draftNotes`, `fulfillment`, `googleAds`, `importProvenance`, `lastCheckedAt`, `lastChangeAt`, `lastChangeSource`, `lastChangeSummary`, `lastChangedBy`, `lastEditedAt`, `lastEditedBy`, `launchNotes`, `layoutPositions`, `licenseStatus`, `pageQuality`, `review`, `revision`, `schemaControls`, `source`, `sourceFile`, `sourceRow`, `staticPublishing`, `status`, `template`, `uniqueValueReason`, `usageStatus`, `validation`, and `workflow`.

## Preserved Public Rendering

The cleanup preserves:

- visible page content
- approved routes `/`, `/contact`, `/service-areas`
- SEO title, description, robots meta, canonical, Open Graph, and Twitter metadata
- structured data rendering path
- form configuration needed by the public form UI
- public media URLs
- public partner CTA URL source used by the rendered homepage

## Deployable Output Scan

After export, this scan returned no matches in deployable output:

```text
rg -n "Static generation and production indexing are not authorized|needs_review|schemaWarnings|pageQuality|usageStatus" apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
```

The same strings remain in the CMS snapshot files, which is acceptable because the snapshots are local/generated source inputs and are not the public deployable HTML payload.

## Static Publish Manifest

`static-publish-manifest.json` now records `qualityWarningCount` and `qualityWarningsRedacted` instead of writing raw quality warning text into the deployable artifact manifest.
