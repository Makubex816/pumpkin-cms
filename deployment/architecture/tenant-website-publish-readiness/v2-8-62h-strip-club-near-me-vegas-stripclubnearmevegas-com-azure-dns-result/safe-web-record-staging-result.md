# Safe Web Record Staging Result

Final Azure readback at `2026-07-14T00:16:10Z`:

| Name | Type | TTL | Value | Result |
| --- | --- | ---: | --- | --- |
| `@` | A | 300 | `20.118.48.17` | staged and read back |
| `www` | CNAME | 300 | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net.` | staged and read back |
| `asuid` | TXT | 300 | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` | staged and read back |
| `asuid.www` | TXT | 300 | same current App Service verification ID | staged and read back |

The zone contains six record sets total: the four staged sets plus Azure's NS and SOA sets.

During staging, the installed Azure CLI required a value for the TXT create command's conditional option. The two create calls stopped before mutation, then the approved TXT add operations created the sets at default TTL 3600. Their exact values were read back and their TTLs alone were reconciled to 300 with ETag guards. Final readback and all four authoritative servers agree.

No wildcard, AAAA, MX, SPF, DKIM, DMARC, null MX, certificate-validation, or unexplained duplicate record was created.
