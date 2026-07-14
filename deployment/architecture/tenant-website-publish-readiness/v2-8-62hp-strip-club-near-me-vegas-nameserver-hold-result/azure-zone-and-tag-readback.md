# Azure Zone and Tag Readback

Fresh readback completed at `2026-07-14T02:18:03.7241485Z`.

| Field | Value |
| --- | --- |
| Subscription | `ff887def-fd83-4a19-9298-13d4b1687873` |
| Zone count | 1 |
| Zone | `stripclubnearmevegas.com` |
| Resource group | `rg-pumpkin-api-prod-centralus` |
| Association ID | `strip-club-near-me-vegas--stripclubnearmevegas-com` |
| Resource role | `tenant-public-dns-zone` |
| Delegation tag | `preprovisioned-not-delegated` |

All eight expected H tags matched. Azure still assigns:

- `ns1-03.azure-dns.com.`
- `ns2-03.azure-dns.net.`
- `ns3-03.azure-dns.org.`
- `ns4-03.azure-dns.info.`

The apex A, `www` CNAME, `asuid` TXT, and `asuid.www` TXT records all remain present at TTL 300. TXT contents were not printed; both were nonempty and shared safe SHA-256 `60046b3c222f3ab9fd768b4d8a418a2ea357758c8d38355a9dc656ee681dbd18`.

Vegas hostname bindings: 0. Vegas certificates: 0. Azure DNS mutations by HPR: 0.
