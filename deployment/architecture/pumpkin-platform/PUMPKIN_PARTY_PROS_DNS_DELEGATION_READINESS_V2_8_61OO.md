# Pumpkin Party Pros DNS Delegation Readiness V2.8.61OO

Date: 2026-07-09

## Decision

Status: `held_pending_email_dns_export`.

Web DNS records are staged in Azure DNS, including apex A.

Manual nameserver change is not recommended until email DNS is exported/migrated or the owner explicitly accepts no-email behavior.

## Nameservers

Current:

```text
ns1.afternic.com
ns2.afternic.com
```

Target:

```text
ns1-03.azure-dns.com.
ns2-03.azure-dns.net.
ns3-03.azure-dns.org.
ns4-03.azure-dns.info.
```

No registrar mutation occurred.
