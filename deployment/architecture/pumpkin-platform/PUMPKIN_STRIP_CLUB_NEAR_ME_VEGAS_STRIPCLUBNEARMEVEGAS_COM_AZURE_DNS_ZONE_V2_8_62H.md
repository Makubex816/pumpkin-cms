# Pumpkin Strip Club Near Me Vegas Azure DNS Zone V2.8.62H

The public Azure DNS zone `stripclubnearmevegas.com` is associated with Pumpkin tenant `strip-club-near-me-vegas` under association ID `strip-club-near-me-vegas--stripclubnearmevegas-com`.

## Azure Resource

- resource group: `rg-pumpkin-api-prod-centralus`;
- role: `tenant-public-dns-zone`;
- state: `preprovisioned-not-delegated`;
- creation state: created in V2.8.62H;
- final matching-zone count: one;
- tags: all eight approved tenant/domain tags read back exactly.

## Predelegation Records

| Name | Type | TTL | Target |
| --- | --- | ---: | --- |
| `@` | A | 300 | `20.118.48.17` |
| `www` | CNAME | 300 | starter default App Service hostname |
| `asuid` | TXT | 300 | current App Service verification ID |
| `asuid.www` | TXT | 300 | current App Service verification ID |

Azure NS and SOA record sets are also present. All four assigned Azure nameservers returned authoritative matching answers.

The zone is not public authority yet. GoDaddy still delegates to `ns49.domaincontrol.com` and `ns50.domaincontrol.com`. No registrar action, custom hostname binding, TLS, deployment, publication, indexing, runtime-key use, form submission, or Airstrip request occurred.
