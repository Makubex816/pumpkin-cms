# No-Email DNS Preservation Result

## Owner Direction

Owner clarified that this is a new domain and no email service should be attached right now.

## Azure DNS Mutation

Approved no-email records were created in the existing Azure DNS zone:

| Name | Type | Value |
| --- | --- | --- |
| `@` | MX | `.` preference `0` |
| `@` | TXT | `v=spf1 -all` |

## Public Proof

After negative-cache expiry, public resolvers returned:

- MX `.` preference `0`;
- TXT `v=spf1 -all`.

## Held Records

No DKIM records were created.

No DMARC record was created.

No email-service records were created.

Do not claim email delivery works. The posture is intentionally no-email.
