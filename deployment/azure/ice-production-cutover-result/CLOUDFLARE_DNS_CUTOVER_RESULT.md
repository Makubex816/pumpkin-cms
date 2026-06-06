# Cloudflare DNS Cutover Result

Generated: 2026-06-06

## Mutations Performed

| Name | Before | After | Proxied | TTL |
| --- | --- | --- | --- | --- |
| `iceskatingrinkrentals.com` | A `66.81.203.198` | CNAME `happy-mud-0b375e20f.7.azurestaticapps.net` | false | auto |
| `www.iceskatingrinkrentals.com` | A `66.81.203.198` | CNAME `happy-mud-0b375e20f.7.azurestaticapps.net` | false | auto |

## Validation TXT Records

| Name | Type | Class | Proxied | TTL |
| --- | --- | --- | --- | --- |
| `_dnsauth.www.iceskatingrinkrentals.com` | TXT | Azure Static Web Apps validation | false | auto |
| `iceskatingrinkrentals.com` | TXT | Azure Static Web Apps validation | false | auto |

Validation TXT values were not recorded in repository docs.

## Preserved Records

| Name | Type | Content | Proxied | Status |
| --- | --- | --- | --- | --- |
| `media.iceskatingrinkrentals.com` | CNAME | `iceskatingmedia.blob.core.windows.net` | true | preserved |
| `iceskatingrinkrentals.com` | MX | `iceskatingrinkrentals-com.mail.protection.outlook.com` | false | preserved |
| `iceskatingrinkrentals.com` | TXT | SPF | false | preserved |
| `iceskatingrinkrentals.com` | TXT | Microsoft 365 verification | false | preserved |
| `autodiscover.iceskatingrinkrentals.com` | CNAME | `autodiscover.outlook.com` | false | preserved |

## Boundary

No Cloudflare Worker, cache rule, page rule, redirect rule, custom hostname, SSL/TLS mode, DNSSEC, MX, Microsoft 365, media, or autodiscover changes were made.
