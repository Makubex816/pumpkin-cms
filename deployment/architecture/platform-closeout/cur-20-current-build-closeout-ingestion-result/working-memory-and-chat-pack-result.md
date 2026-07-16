# Working-memory and CHAT-PACK result

Result: blocked before v1.0.0 package release and CHAT-PACK regeneration.

Validated input:

- Filename: `PumpkinCMS_Chat_Working_Memory_Persistence_Package_v0.9.0-precloseout_2026-07-15.zip`
- SHA-256: `1ff1a4ab9cf8657df7566df8463e770dcc07e2a94fa6d47817ab1410264b49f9`
- ZIP entries: 46
- CRC/read errors: 0
- Extracted JSON files parsed: 11
- Internal `checksums.sha256` entries checked: 45
- Checksum mismatches: 0
- YAML structural scan: 5 `.yaml` files, no leading-tab or control-character findings

Authority result:

The package is a valid pre-closeout input. It records the active phase as `V2.8.63CRST` and explicitly requires refresh after final closeout. CRSTUR supersedes that state, but the active Build Atlas was not found, so CUR-20 did not release the required post-closeout `v1.0.0` package.

Not produced:

- `PumpkinCMS_Chat_Working_Memory_Persistence_Package_v1.0.0.zip`
- `PumpkinCMS_Chat_Working_Memory_Master_v1.0.0.md`
- `PumpkinCMS_Chat_Working_Memory_Persistence_Package_v1.0.0_VALIDATION.txt`
- final regenerated `CHAT-PACK.md`

The supplied Atlas bridge contains a generated `CHAT-PACK.md`, but it is pre-closeout/pre-active-Atlas and was not promoted as current truth.

