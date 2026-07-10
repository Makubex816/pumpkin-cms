# Public Nameserver Propagation Proof

## Result

Status: `complete`.

All checked public resolvers returned the expected Azure nameservers.

## Resolvers Checked

| Resolver | Nameservers |
| --- | --- |
| Cloudflare `1.1.1.1` | `ns1-03.azure-dns.com`, `ns2-03.azure-dns.net`, `ns3-03.azure-dns.org`, `ns4-03.azure-dns.info` |
| Google `8.8.8.8` | `ns1-03.azure-dns.com`, `ns2-03.azure-dns.net`, `ns3-03.azure-dns.org`, `ns4-03.azure-dns.info` |
| Quad9 `9.9.9.9` | `ns1-03.azure-dns.com`, `ns2-03.azure-dns.net`, `ns3-03.azure-dns.org`, `ns4-03.azure-dns.info` |

## Interpretation

The owner/client nameserver change has propagated to the tested resolvers.

Codex did not log into the registrar and did not change nameservers.
