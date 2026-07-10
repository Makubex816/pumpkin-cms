# Updated Manual Nameserver Packet

## Status

Nameserver propagation status: `complete`.

Manual nameserver change has already been performed by owner/client outside Codex.

Codex validation only. No registrar login or mutation occurred.

## Current Nameservers

```text
ns1-03.azure-dns.com
ns2-03.azure-dns.net
ns3-03.azure-dns.org
ns4-03.azure-dns.info
```

## Azure DNS Inventory

| Name | Type | Value |
| --- | --- | --- |
| `@` | A | `20.118.48.17` |
| `@` | MX | `.` preference `0` |
| `@` | TXT | `v=spf1 -all` |
| `www` | CNAME | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` |
| `asuid` | TXT | App Service verification id |
| `asuid.www` | TXT | App Service verification id |

## No-Email Posture

Email is intentionally not configured.

No DKIM or DMARC records were created.

## Remaining Future Steps

Future approvals are still required for:

- Azure App Service custom hostname binding;
- managed TLS;
- Party Pros publish;
- host-based Party Pros root-domain rendering proof;
- contact/form POST proof.
