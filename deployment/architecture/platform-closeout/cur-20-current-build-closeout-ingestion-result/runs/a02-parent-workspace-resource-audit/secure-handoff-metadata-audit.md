# Secure handoff metadata audit

Scope: `secure-operator-handoff`

Only metadata, filenames, sizes, timestamps, and hashes were recorded. Secret-bearing files were not printed.

## Top-level secure areas

| Area | Bytes | Files | Dirs | Archives | Classification |
| --- | ---: | ---: | ---: | ---: | --- |
| `operator-workflow-proofs` | 36,581,918 | 147 | 52 | 1 | workflow proof and backup/restore evidence |
| `platform-backups` | 5,452,133 | 86 | 15 | 0 | platform backup evidence |
| `platform-identity` | 997,917,087 | 3,428 | 753 | 27 | identity/platform handoffs and packages |
| `program-management` | 0 | 0 | 1 | 0 | empty shell |
| `tenant-backups` | 237,690,837 | 1,438 | 145 | 1 | tenant backup evidence |
| `tenant-credentials` | 4,666 | 5 | 3 | 0 | secret-bearing boundary |
| `tenant-dns` | 75,084 | 9 | 3 | 0 | DNS operation metadata |
| `tenant-launch` | 5,813 | 8 | 5 | 0 | tenant launch metadata |
| `tenant-launch-approvals` | 21,758 | 3 | 4 | 0 | launch approvals |

Additional versioned handoff directories were observed for prior key rotation, tenant creation, Airstrip creation, master operator hardcopy, Party Pros, Vegas, and related V2.8 handoff events. They were classified as historical/current-reference secure metadata depending on milestone.

## Manifest and checksum metadata

31 manifest/checksum-like files were found. Representative safe entries:

| Relative path | Bytes | SHA-256 |
| --- | ---: | --- |
| `secure-operator-handoff/platform-identity/v2-8-63crst-capacity-and-identity-activation/result-manifest.json` | 2,453 | `8f12c9ed79d6bddb7b0340858c53101645b1602b99c805a0a39ad1fd5886feac` |
| `secure-operator-handoff/platform-identity/v2-8-63crst-capacity-and-identity-activation/CHECKSUMS.sha256` | 369 | `df5b43c540f21127a5197b0227d6d7e988d83c2eb9e27909781dfbc7aae37782` |
| `secure-operator-handoff/tenant-backups/v2-8-61of-party-pros-full-backup-proof/manifest.json` | 3,974 | `b97153839a8ebe1dc171b6c03ef7b3baab11af84ad3d097baa46c04efbd5a6b1` |
| `secure-operator-handoff/tenant-backups/v2-8-62k-strip-club-near-me-vegas-final/checksums.sha256` | 51,173 | `f05efb4dad0343167dfe361988a085c1ce15ce7632f0b0ba79a8251a22ccedd8` |
| `secure-operator-handoff/v2-8-54e-live-resource-secret-hardcopy/LIVE_RESOURCE_SECRET_OPERATOR_HARD_COPY.sha256` | 221 | `abfc1b77349b080f11d471c60ca149f43c517d1f4c2711d1d9f4bcf11cc37f0d` |

## Atlas result

No `.project-ops`, active Atlas directory, milestone ledger, attempt ledger, current-state/current-phase Atlas package, or CHAT-PACK authority was found inside secure handoff metadata. The secure tree remains an evidence and secret-boundary source, not the active Atlas.
