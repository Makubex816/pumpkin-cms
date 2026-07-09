# Current State Summary

## Live State

Azure DNS zone `partyrentalphiladelphia.com` exists in `rg-pumpkin-api-prod-centralus`.

Public delegation still points to Afternic:

- `ns1.afternic.com`
- `ns2.afternic.com`

Azure target nameservers:

- `ns1-03.azure-dns.com.`
- `ns2-03.azure-dns.net.`
- `ns3-03.azure-dns.org.`
- `ns4-03.azure-dns.info.`

Azure DNS now has six record sets:

- `@` A
- `@` NS
- `@` SOA
- `asuid` TXT
- `www` CNAME
- `asuid.www` TXT

## Current Decision

Manual delegation remains held pending email DNS export/migration.

Web records are staged, but email preservation is unresolved.
