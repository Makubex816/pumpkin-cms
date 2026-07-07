# Media Export Proof

Status: passed.

Media export used public blob URLs only. No storage keys, listKeys, SAS, connection strings, or Key Vault values were used.

- Media container: `airstrip-club-las-vegas-media`.
- Public base: `https://iceskatingmedia.blob.core.windows.net/airstrip-club-las-vegas-media`.
- MediaAsset records: 13.
- Media blobs downloaded: 13.
- Total media bytes: 3,803,217.
- Media manifest: `media/media-manifest.json`.

All downloaded media blobs are covered by `checksums.sha256`.
