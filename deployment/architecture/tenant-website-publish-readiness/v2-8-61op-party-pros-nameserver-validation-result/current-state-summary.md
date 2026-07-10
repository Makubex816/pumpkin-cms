# Current State Summary

## Nameservers

Delegation is complete.

All checked public resolvers return Azure DNS:

- `ns1-03.azure-dns.com`
- `ns2-03.azure-dns.net`
- `ns3-03.azure-dns.org`
- `ns4-03.azure-dns.info`

## Web DNS

Public DNS matches Azure DNS:

- apex A `20.118.48.17`;
- `www` CNAME `app-pumpkin-starter-preview-centralus-001.azurewebsites.net`;
- `asuid` TXT;
- `asuid.www` TXT.

## Email DNS

Owner clarified that no email service is intended right now.

Azure DNS and public DNS now preserve no-email posture:

- MX `.` preference `0`;
- SPF TXT `v=spf1 -all`;
- no DMARC;
- no DKIM.

## Custom Domain

Custom-domain binding is not performed.

Managed TLS is not performed.

Party Pros pages remain unpublished.

Host-based Party Pros root-domain rendering is not proven.
