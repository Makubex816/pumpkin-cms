# Media Creation Plan

Target storage account: `iceskatingmedia`.

Resource group: `rg-ice-production-media`.

Target container: `strip-club-near-me-vegas-media`.

Target blob naming: `strip-club-near-me-vegas/{canonical-source-relative-path}`.

| Graph scope | Physical aliases | Unique hashes | Planned treatment |
| --- | ---: | ---: | --- |
| Dependency/source-use evidence | 266 | 152 | preserve or deduplicate with every alias retained |
| Without dependency proof | 207 | 150 | retain as blocked candidates; no exclusion by first-scan result |
| Full deduplicated package | 473 | 302 | retained candidate universe; exact import count pending |

The graph contains 532 mapped dependency edges and 12 unresolved references to 8 absent filenames. It also discovers the favicon and JavaScript fallback hash missed by the initial scan. Therefore V2.8.62CR must not upload media. A later creation phase may freeze an exact count only after every hash is dependency-backed, conclusively dead, owner-excluded, or remains blocked with live creation held.

Use Entra/RBAC through the existing shared account. Do not request storage keys, listKeys, or SAS. Before upload, verify container absence or classify an unexpected existing container. Never delete or recreate an unexpected container without separate approval.

For each future approved hash group, upload one canonical object only when an alias manifest preserves every required original path. Read back existence/size/hash before creating MediaAsset metadata with aliases, URL, container, blob path, checksum, rights status, and usage status. Stop on the first mismatch and document exact partial counts. Public use remains held until explicit-content and rights reviews pass.
