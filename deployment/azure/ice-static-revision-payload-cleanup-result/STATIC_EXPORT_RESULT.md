# Static Export Result

Command:

```powershell
cd apps/ice-rink-web
npm run export:static:ice:cms
```

Exit code: `0`

Snapshot result:

| Field | Result |
| --- | --- |
| discovered page count | 6 |
| page count after approved route filter | 3 |
| published count | 3 |
| unpublished count | 0 |
| theme snapshot | true |
| snapshot slugs | `contact`, `home`, `service-areas` |
| excluded slugs | `events-holiday-activations`, `ice-rink-rentals`, `phase-5a-csv-import-54754949` |

Static publish result:

| Field | Result |
| --- | --- |
| content source | `cms-snapshot` |
| page count | 3 |
| sitemap count | 3 |
| redirect count | 0 |
| output snapshot | true |

Approved page route proof:

```text
/
/contact
/service-areas
```

The generated standard `404` output is present. Preview and obsolete deployable paths are absent.

Static publish warnings remain for form endpoint readiness, `staticPublishing.needsRebuild`, fulfillment readiness, and removed preview output paths. No media URL warning remains from `revision.latestSnapshot`.

