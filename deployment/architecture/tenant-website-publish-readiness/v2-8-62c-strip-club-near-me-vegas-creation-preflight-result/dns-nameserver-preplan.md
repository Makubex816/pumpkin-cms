# DNS And Nameserver Preplan

Fresh public readback used resolver `1.1.1.1` at `2026-07-11T05:43:49.8238407Z`.

| Query | Current answer |
| --- | --- |
| Apex NS | `ns49.domaincontrol.com`, `ns50.domaincontrol.com` |
| Apex A | `3.33.130.190`, `15.197.148.33` |
| `www` CNAME | `stripclubnearmevegas.com` |
| Apex MX | no answer |
| Apex TXT | no answer |

V2.8.62C created no Azure DNS zone and did not query or mutate registrar state. Azure target nameservers are unavailable until a separately approved Azure DNS zone creation phase.

Later sequence, following the Party Pros standard:

1. Finish tenant creation, runtime adapter, deploy readiness, and no-post preview proof.
2. Separately approve Azure DNS zone creation for `stripclubnearmevegas.com`.
3. Read back the four Azure-assigned nameservers.
4. Pre-stage only source-supported web records. Use the actual starter inbound IP for apex A; never use an outbound IP or guess.
5. Produce a manual registrar nameserver packet.
6. Keep registrar login and nameserver changes manual and separately approved.
7. Validate delegation before custom-domain binding and managed TLS.

No DNS, nameserver, DomainBinding, hostname, or TLS action is part of V2.8.62CR.
