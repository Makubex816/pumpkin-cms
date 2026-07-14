# Current Public DNS Inventory

Fresh inventory was collected before Azure creation at `2026-07-14T00:06:24Z` and rechecked after staging at `2026-07-14T00:16:21Z`.

Cloudflare `1.1.1.1`, Google `8.8.8.8`, and Quad9 `9.9.9.9` agreed.

| Name | Type | Public value | TTL observation |
| --- | --- | --- | --- |
| apex | NS | `ns49.domaincontrol.com`, `ns50.domaincontrol.com` | authoritative TTL 3600 |
| apex | SOA | `ns49.domaincontrol.com`, `dns.jomax.net`, serial `2026062700` | default TTL 600 |
| apex | A | `3.33.130.190`, `15.197.148.33` | source TTL 600; resolver cache remaining varied |
| apex | AAAA | none | n/a |
| apex | CNAME | none | n/a |
| apex | TXT | none | n/a |
| apex | MX | none | n/a |
| apex | CAA | none | negative TTL 600 |
| apex | DS | none | n/a |
| `www` | CNAME | `stripclubnearmevegas.com` | authoritative TTL 3600 |
| `www` | A through CNAME | same two parked apex addresses | source TTL 600 |
| `www` | AAAA/TXT/MX/CAA/DS | none | n/a |

CAA queries used raw type 257 against all three requested resolvers because the local Windows resolver does not expose CAA in its record-type enum. All six apex/WWW CAA queries returned NOERROR with zero CAA answers.

The final readback proves Azure preprovisioning did not change public GoDaddy delegation or current public records.
