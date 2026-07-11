# DNS and Nameserver Readiness

Read-only public DNS check used resolver `1.1.1.1` at `2026-07-11T01:58:21Z`.

| Name | Type | TTL | Value |
| --- | --- | ---: | --- |
| apex | NS | 3600 | `ns49.domaincontrol.com` |
| apex | NS | 3600 | `ns50.domaincontrol.com` |
| apex | A | 600 | `3.33.130.190` |
| apex | A | 600 | `15.197.148.33` |
| `www` | CNAME | 3600 | `stripclubnearmevegas.com` |

No apex or `www` TXT or MX answer was returned. The `www` A query follows its CNAME to the apex A values.

Readiness classification:

- domain values are known;
- current DNS is likely managed through a GoDaddy/DomainControl zone based on the nameservers;
- current A/CNAME records do not target the shared Pumpkin starter host;
- no Azure nameserver delegation is active; Azure zone inventory was not needed for this public-DNS preflight;
- domain email DNS is not configured through visible MX records;
- registrar/provider access and mutation approval are not part of V2.8.62A.

DNS records, nameservers, bindings, and TLS mutations: 0.
