# Pumpkin Party Pros DNS Nameserver Packet V2.8.61OL

Date: 2026-07-09

## Boundary

No Bluehost login, registrar login, DNS mutation, nameserver change, Azure DNS zone creation, or App Service custom-domain binding occurred.

## Current Nameservers

| Name | Current nameservers |
| --- | --- |
| `partyrentalphiladelphia.com` | `ns1.afternic.com`, `ns2.afternic.com` |
| `www.partyrentalphiladelphia.com` | `ns1.afternic.com`, `ns2.afternic.com` |

## Selected Strategy

Registrar-managed DNS by default.

Target nameservers:

```text
ns1.afternic.com
ns2.afternic.com
```

Action: no nameserver change.

## Future Custom-Domain Records

Not applied in OL.

| Host | Type | Target/value |
| --- | --- | --- |
| `@` | A | `20.118.48.17` |
| `asuid` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |
| `www` | CNAME | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` |
| `asuid.www` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |

Recheck the App Service default host, verification id, and current A target before any future cutover.

## Azure DNS

No Azure DNS zone exists for `partyrentalphiladelphia.com` in the visible subscription readback.

No Azure DNS target nameservers are available in OL. A future Azure DNS delegation phase must read actual zone `nameServers` after the zone exists.
