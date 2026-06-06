# Rollback Plan

Generated: 2026-06-06

## Fast DNS Rollback

If rollback is approved, restore only the two captured root/www Cloudflare DNS records:

| Name | Type | Content | Proxied | TTL |
| --- | --- | --- | --- | --- |
| `iceskatingrinkrentals.com` | A | `66.81.203.198` | false | auto |
| `www.iceskatingrinkrentals.com` | A | `66.81.203.198` | false | auto |

Do not change media, MX, SPF, Microsoft 365 TXT, or autodiscover records during DNS rollback.

## Optional Azure Cleanup

After traffic rollback is confirmed, and only with separate approval:

1. Remove `www.iceskatingrinkrentals.com` from `swa-ice-static-staging`.
2. Remove `iceskatingrinkrentals.com` from `swa-ice-static-staging`.
3. Remove Azure Static Web Apps validation TXT records.

Do not remove Microsoft 365 verification TXT or SPF records.

## Validation After Rollback

Run:

```text
az staticwebapp hostname list --name swa-ice-static-staging --resource-group rg-ice-static-staging
Resolve-DnsName iceskatingrinkrentals.com -Type A
Resolve-DnsName www.iceskatingrinkrentals.com -Type A
Resolve-DnsName media.iceskatingrinkrentals.com -Type CNAME
Resolve-DnsName iceskatingrinkrentals.com -Type MX
Resolve-DnsName autodiscover.iceskatingrinkrentals.com -Type CNAME
```

Then repeat public HTTP checks for apex and `www`.

## Boundary

Rollback is not executed in this result package. It requires explicit rollback approval.
