# Target Azure Nameservers

Azure assigned these target nameservers to `partyrentalphiladelphia.com`:

```text
ns1-03.azure-dns.com.
ns2-03.azure-dns.net.
ns3-03.azure-dns.org.
ns4-03.azure-dns.info.
```

All four values were read from the created Azure DNS zone.

## Manual Delegation Use

These are the target values for the future owner/client manual nameserver change.

Do not change registrar nameservers until:

- email/MX/SPF/DKIM/DMARC records are inventoried and migrated;
- apex A status is resolved or explicitly accepted as pending;
- owner/client approves the nameserver switch;
- a rollback owner and validation window are named.
