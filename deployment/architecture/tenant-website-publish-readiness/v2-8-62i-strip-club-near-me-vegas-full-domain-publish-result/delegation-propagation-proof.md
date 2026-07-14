# Delegation Propagation Proof

Status: passed.

From `2026-07-14T16:23:39.9998819Z` through `2026-07-14T16:23:42.3661770Z`, 48 DNS queries through Cloudflare, Google, and Quad9 completed with zero errors. Every resolver returned the same four Azure nameservers:

- `ns1-03.azure-dns.com`;
- `ns2-03.azure-dns.net`;
- `ns3-03.azure-dns.org`;
- `ns4-03.azure-dns.info`.

All resolvers also returned Azure SOA serial 1, apex A `20.118.48.17`, and WWW CNAME `app-pumpkin-starter-preview-centralus-001.azurewebsites.net`. No public MX, apex TXT, CAA, or DS record was observed. No DNS mutation occurred.
