# Pumpkin Party Pros Email DNS Inventory V2.8.61OO

Date: 2026-07-09

## Public DNS

Current public DNS under Afternic shows:

- MX `.` preference `0`;
- TXT `v=spf1 -all`;
- `_dmarc` TXT returned `v=spf1 -all`, which is not a valid DMARC policy;
- common DKIM selector TXT probes returned the same visible TXT response;
- common DKIM selector CNAME probes did not return DKIM CNAME values.

## Azure DNS

Azure DNS has no MX records.

Azure DNS has no migrated SPF, DKIM, or DMARC records.

Azure TXT records are App Service verification records only:

- `asuid`;
- `asuid.www`.

## Decision

Email DNS preservation is unresolved.

Do not recommend manual nameserver delegation until the owner provides a full DNS export or explicitly confirms no-email behavior is acceptable.
