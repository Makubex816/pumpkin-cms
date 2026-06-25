# Backup Classification

| Classification | Result | Reason |
| --- | --- | --- |
| Source rebuild candidate | yes | CMS pages, routes, SEO, theme, forms, media metadata, and blob inventory are present. |
| Media metadata recovery candidate | yes | 12 MediaAsset metadata records and public media references are present. |
| Full static rollback candidate | no | The zip has no deployable static `out/` artifact. |
| Complete binary asset bundle | no | The zip has zero image-file entries and `media/blobs/` contains no binaries. |
| Asset-only candidate | no | It has strong metadata, but no binaries. |

The backup should be used to rebuild controlled local source, not to roll back production directly.

