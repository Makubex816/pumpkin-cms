# Media Normalization Result

| Measure | Result |
| --- | ---: |
| Physical source files | 473 |
| Physical bytes | 39,521,491 |
| Unique SHA-256 groups | 302 |
| Duplicate-content groups | 157 |
| Duplicate physical aliases beyond unique hashes | 171 |
| Referenced physical files | 154 |
| Referenced unique assets | 150 |
| Unreferenced physical files | 319 |
| Unreferenced-only unique assets | 152 |

The manifest uses SHA-256 for content identity. Every physical source-relative path is retained as an alias so duplicate names in different directories cannot collide. Each unique asset has a proposed target path under `strip-club-near-me-vegas/` in planned container `strip-club-near-me-vegas-media`.

The recommended initial upload set is the 150 referenced unique assets, subject to explicit-content and media-rights review. The remaining 152 unique unreferenced-only assets are separately identifiable and must not be treated as required merely because they were present in the package.

No blob, container, storage setting, storage credential, key, SAS, or media record was created or changed.
