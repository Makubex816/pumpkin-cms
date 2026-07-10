# DNS Propagation Prebinding Proof

Status: passed.

Public readback before hostname binding:

| Resolver | NS | A | www CNAME | asuid TXT | asuid.www TXT | MX | root TXT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `1.1.1.1` | four Azure NS | `20.118.48.17` | starter default host | present | present | `0 .` | `v=spf1 -all` |
| `8.8.8.8` | four Azure NS | `20.118.48.17` | starter default host | present | present | `0 .` | `v=spf1 -all` |
| `9.9.9.9` | four Azure NS | `20.118.48.17` | starter default host | present | present | `0 .` | `v=spf1 -all` |

Azure nameservers returned publicly:

- `ns1-03.azure-dns.com`
- `ns2-03.azure-dns.net`
- `ns3-03.azure-dns.org`
- `ns4-03.azure-dns.info`

Azure DNS direct readback:

- Apex A `@`: `20.118.48.17`, TTL `3600`.
- `www` CNAME: `app-pumpkin-starter-preview-centralus-001.azurewebsites.net`, TTL `3600`.
- `asuid` TXT: public App Service verification value present, TTL `3600`.
- `asuid.www` TXT: public App Service verification value present, TTL `3600`.
- MX `@`: preference `0`, exchange `.`, TTL `3600`.
- TXT `@`: `v=spf1 -all`, TTL `3600`.

Decision: prebinding DNS gates passed.
