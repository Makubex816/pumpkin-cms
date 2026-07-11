# Media Dependency Graph

## Method And Safety

The graph was built from detached HTML DOM attributes, `srcset`, inline styles, CSS `url()`, JavaScript string literals, JSON/data strings, and internal source-use metadata. Uploaded JavaScript was not executed, and package network access was blocked.

Graph identity is SHA-256 content hash. Every physical source path remains an alias even when one canonical binary is stored.

## Graph Totals

| Measure | Count |
| --- | ---: |
| Physical image paths | 473 |
| Unique content hashes | 302 |
| Duplicate-content groups | 157 |
| Redundant physical aliases beyond one per hash | 171 |
| Hashes with dependency/source-use evidence | 152 |
| Physical aliases in those 152 groups | 266 |
| Mapped dependency edges | 532 |
| Hashes without dependency proof | 150 |
| Physical aliases in unresolved groups | 207 |
| Unresolved source-reference edges | 12 |

The original HTML-only scan reached 150 hashes. The expanded graph added:

- `assets/images/brand/scnmv-favicon-location-pin.webp` through HTML `href`; and
- the hash shared by `assets/images/brand/scnmv-logo-mark-neon-pin.webp` and `assets/images/logo-placeholder-nightlife.webp` through the JavaScript fallback path.

This proves that the earlier 150-object recommendation was incomplete.

## Dispositions

| Graph class | Count | Disposition |
| --- | ---: | --- |
| dependency-backed hashes | 152 | preserve or deduplicate by hash with all original aliases retained |
| no reference evidence | 135 | blocked from exclusion pending conclusive dead-asset proof or owner approval |
| inventory-only `unused` evidence | 15 | blocked from exclusion; an internal label is evidence, not final dead-code proof |
| unresolved filenames | 8 names / 12 references | resolve source target or record owner-review gap |

The unresolved filenames are the `v18`/`v19` variants of club-exterior, bachelor-party, limo-pickup, and host-escort guide images referenced by internal metadata but absent under an unambiguous source path.

## Import Rule

No 62CR blob upload is approved. Keep all 302 unique hashes as retained candidates until the 150 unresolved groups and 12 reference edges are adjudicated. A later import may upload one object per approved hash only if an alias manifest makes every required original path resolvable and browser proof confirms all HTML, CSS, responsive, fallback, gallery, and dynamic references.

MediaAsset creation remains after blob existence/size/hash readback. Rights and explicit-content review remain separate public-launch gates. No storage object, container, key, listKeys call, or SAS was created in V2.8.62C.
