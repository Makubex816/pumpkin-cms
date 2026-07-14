# Authoritative Azure Nameserver Proof

Status: passed 4/4 at `2026-07-14T00:15:09Z`.

The local network transparently intercepts outbound UDP and TCP port 53. This was proven without touching a real service: DNS replies and a TCP connection were returned even when targeting reserved TEST-NET address `203.0.113.1`. Local direct-query output therefore could not establish the authoritative bit.

The final proof used the public DNSlurp HTTPS query executor to target each Azure nameserver IPv4 directly. It returned `authoritative: true`, `NOERROR`, matching SOA/NS sets, and the four exact staged records for every server.

| Azure nameserver | Target IPv4 | SOA/NS | Apex A | WWW CNAME | Both TXT | TTL 300 | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ns1-03.azure-dns.com.` | `13.107.236.3` | match | match | match | match | match | pass |
| `ns2-03.azure-dns.net.` | `150.171.21.3` | match | match | match | match | match | pass |
| `ns3-03.azure-dns.org.` | `204.14.183.3` | match | match | match | match | match | pass |
| `ns4-03.azure-dns.info.` | `208.84.5.3` | match | match | match | match | match | pass |

Common SOA: `ns1-03.azure-dns.com azuredns-hostmaster.microsoft.com 1 3600 300 2419200 300`.

Common NS set: all four assigned Azure nameservers.

Common staged data: apex A `20.118.48.17`, `www` CNAME to the starter default hostname, and matching `asuid`/`asuid.www` verification TXT records.

Method references:

- `https://learn.microsoft.com/en-us/azure/dns/dns-getstarted-powershell`
- `https://dnslurp.esoup.net/api.html`

Public recursive resolvers still return GoDaddy delegation, which is expected before manual nameserver replacement.
