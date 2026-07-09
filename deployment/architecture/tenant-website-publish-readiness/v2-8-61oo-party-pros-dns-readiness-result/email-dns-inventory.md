# Email DNS Inventory

## Public DNS Readback

Current public DNS is still served by Afternic nameservers.

| Query | Result |
| --- | --- |
| `partyrentalphiladelphia.com` MX | `.` with preference `0` |
| `partyrentalphiladelphia.com` TXT | `v=spf1 -all` |
| `_dmarc.partyrentalphiladelphia.com` TXT | `v=spf1 -all` returned by public DNS; not a valid DMARC policy |
| Common DKIM selector TXT probes | returned `v=spf1 -all` from public DNS |
| Common DKIM selector CNAME probes | no CNAME values found |

The repeated TXT response on subdomains appears wildcard-like under the current public DNS. It does not prove real DKIM or DMARC configuration.

## Azure DNS Readback

Azure DNS currently has no MX records.

Azure DNS currently has only App Service verification TXT records:

- `asuid`
- `asuid.www`

Azure DNS does not contain SPF, DKIM, or DMARC records for the domain.

## Risk

Manual nameserver delegation can change email behavior immediately.

If the client expects email on this domain, the owner/client must provide a complete DNS export or explicitly approve no-email/null-email behavior before delegation.
