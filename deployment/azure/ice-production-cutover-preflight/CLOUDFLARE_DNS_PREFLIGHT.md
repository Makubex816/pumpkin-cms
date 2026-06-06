# Cloudflare DNS Preflight

Generated: 2026-06-06

## Credentials

Presence-only check:

| Env var | Status |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | PRESENT |
| `CLOUDFLARE_ZONE_ID` | PRESENT |

Values were not printed.

## Zone

Read-only Cloudflare API result:

| Item | Value |
| --- | --- |
| zone | `iceskatingrinkrentals.com` |
| status | active |
| paused | false |
| type | full |
| development mode | 0 |

## Selected DNS Records

| Name | Type | Target | Proxied | TTL |
| --- | --- | --- | --- | --- |
| `iceskatingrinkrentals.com` | A | `66.81.203.198` | false | auto |
| `www.iceskatingrinkrentals.com` | A | `66.81.203.198` | false | auto |
| `media.iceskatingrinkrentals.com` | CNAME | `iceskatingmedia.blob.core.windows.net` | true | auto |
| `iceskatingrinkrentals.com` | MX | `iceskatingrinkrentals-com.mail.protection.outlook.com` | false | auto |
| `iceskatingrinkrentals.com` | TXT | Microsoft 365 verification present | false | auto |
| `iceskatingrinkrentals.com` | TXT | SPF for Microsoft 365 present | false | auto |
| `autodiscover.iceskatingrinkrentals.com` | CNAME | `autodiscover.outlook.com` | false | auto |

No `_dmarc.iceskatingrinkrentals.com` record was observed in the selected API/public checks.

## Interpretation

Root and `www` are still DNS-only and point to the current placeholder/current host IP. They are not pointed at Azure Static Web Apps.

`media.iceskatingrinkrentals.com` is already proxied through Cloudflare to Azure Blob and should remain unchanged during root/www cutover.

Microsoft 365 MX/TXT/autodiscover records should remain unchanged.

No Cloudflare records, rules, workers, cache settings, SSL settings, or purges were changed.
