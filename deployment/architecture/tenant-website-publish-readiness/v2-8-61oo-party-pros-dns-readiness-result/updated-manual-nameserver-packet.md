# Updated Manual Nameserver Packet

## Status

Manual nameserver change status: `held_pending_email_dns_export`.

## Current Nameservers

```text
ns1.afternic.com
ns2.afternic.com
```

## Target Azure Nameservers

```text
ns1-03.azure-dns.com.
ns2-03.azure-dns.net.
ns3-03.azure-dns.org.
ns4-03.azure-dns.info.
```

## Azure DNS Records Ready For Web

| Name | Type | Value |
| --- | --- | --- |
| `@` | A | `20.118.48.17` |
| `www` | CNAME | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` |
| `asuid` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |
| `asuid.www` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |

## Hold Reason

Email DNS is not migrated into Azure DNS.

No MX, SPF, DKIM, or DMARC values were provided by owner/client.

## Future Manual Steps

Only after a separate owner approval:

1. Export or screenshot all current client DNS records.
2. Decide whether the domain should have email.
3. If email is needed, create exact MX/SPF/DKIM/DMARC records in Azure DNS.
4. Validate Azure DNS records.
5. Change registrar nameservers manually to the four Azure target nameservers.
6. Validate public DNS.
7. Roll back to Afternic nameservers if the owner-approved rollback plan is triggered.
