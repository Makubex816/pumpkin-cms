# Atlas authority matrix

| Criterion | Result | Evidence |
| --- | --- | --- |
| Root workspace README references | Not found | Parent root contained no top-level files. |
| Quick-start/recovery manifest references | Not found | No top-level quick-start/recovery manifest; recovery/intake areas did not contain Atlas structural signatures. |
| Current update scripts | Found only in supplied bridge | `cur-20-package-work/.../tools/update_atlas.py` belongs to the proposed bridge. |
| Current operator-handoff references | Not found | Secure handoff metadata contained manifests/checksums but no active Atlas structure. |
| Active repo references | A01 docs only | Active repo contains CUR-20 result docs and historical current-state summaries, but no `.project-ops` or ledgers. |
| Current-state agreement with CRSTUR | Fails for bridge | Bridge current state is pre-closeout and has `existingAtlas.path = null`; CRSTUR closeout came later. |
| Current-phase agreement | Fails for bridge | Bridge awaits current build closeout; it does not include CRSTUR completion. |
| Valid manifest/checksums | Pass for bridge only | Bridge package and v0.9 package pass A01 CRC/hash evidence. |
| Stable milestone and attempt IDs | Present in bridge only | Bridge has ledgers, but proposed status prevents promotion. |
| Package generator and validator | Present in bridge only | Tools exist in bridge package, not active workspace. |
| Preservation of predecessor history | Blocking | No active predecessor history was found; treating bridge as active would fabricate/overwrite authority. |
| Explicit authority statement | Negative | Bridge declares proposed/pre-closeout status. |
| Current companion chat/startup use | Not found | No root or operator startup doc selected bridge as active. |

## Negative indicators applied

- Marked proposed/bridge.
- Pre-closeout state.
- Missing active Atlas path.
- No current references from root docs, operator handoff, recovery manifest, or active source.
- Upstream candidate in bridge (`18b5cea`) has been superseded by current upstream head (`817e176`).
- No active history source to preserve.

## Authority decision

No candidate is authoritative. CUR-20 continuation is blocked because any Atlas mutation would either alter a non-authoritative proposed bridge or invent a new active Atlas history.
