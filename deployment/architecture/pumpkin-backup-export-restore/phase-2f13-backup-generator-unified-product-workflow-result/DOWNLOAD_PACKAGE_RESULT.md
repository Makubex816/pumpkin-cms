# Download Package Result

The optional download package writer was exercised for fake and live-readonly bundles.

Fake recheck package:

| Field | Value |
| --- | --- |
| Status | packaged |
| Output | `.tmp/phase-2f13-unified-backup-generator/fake-download-recheck/` |
| File count | 54 |
| ZIP bytes | 69,236 |
| ZIP SHA-256 | `2529e6e92e737f025e470763c1b40acc92dd8c55bbc268dc97fd01138f2c62f8` |

Live-readonly Ice recheck package:

| Field | Value |
| --- | --- |
| Status | packaged |
| Output | `.tmp/phase-2f13-unified-backup-generator/ice-download-recheck/` |
| File count | 62 |
| ZIP bytes | 23,329,756 |
| ZIP SHA-256 | `8fea85b83fd3dbc5e27574edb0f9acd68d7ac2f3bdcf499c4c27cec5c236fa28` |

The writer validates the bundle before packaging and writes package result reports next to the ZIP. ZIPs remain ignored `.tmp` artifacts and are not staged.
