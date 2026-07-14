# Azure Authoritative Reproof

Azure DNS readback returned:

- zone: `stripclubnearmevegas.com`;
- apex A: `20.118.48.17`, TTL 300;
- WWW CNAME: `app-pumpkin-starter-preview-centralus-001.azurewebsites.net.`, TTL 300;
- four expected Azure nameservers, NS TTL 172800;
- `asuid` and `asuid.www` TXT records present.

TXT plaintext was not printed. A corrected case-sensitive safe-hash comparison on all three public resolvers matched Azure for both records at `2026-07-14T16:24:06.0129469Z`: `60046b3c222f3ab9fd768b4d8a418a2ea357758c8d38355a9dc656ee681dbd18`.

The authoritative configuration is binding-ready, subject to owner and routing gates.
