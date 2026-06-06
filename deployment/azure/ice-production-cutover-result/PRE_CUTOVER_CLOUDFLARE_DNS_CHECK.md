# Pre-Cutover Cloudflare DNS Check

Generated: 2026-06-06

## Captured Rollback Records

| Name | Type | Content | Proxied | TTL |
| --- | --- | --- | --- | --- |
| `iceskatingrinkrentals.com` | A | `66.81.203.198` | false | auto |
| `www.iceskatingrinkrentals.com` | A | `66.81.203.198` | false | auto |

## Records Preserved

| Name | Type | Content | Proxied | Result |
| --- | --- | --- | --- | --- |
| `media.iceskatingrinkrentals.com` | CNAME | `iceskatingmedia.blob.core.windows.net` | true | preserved |
| `iceskatingrinkrentals.com` | MX | `iceskatingrinkrentals-com.mail.protection.outlook.com` | false | preserved |
| `iceskatingrinkrentals.com` | TXT | SPF record | false | preserved |
| `iceskatingrinkrentals.com` | TXT | Microsoft 365 verification record | false | preserved |
| `autodiscover.iceskatingrinkrentals.com` | CNAME | `autodiscover.outlook.com` | false | preserved |

## Validation TXT Records

Azure Static Web Apps DNS TXT validation was required for apex validation.

| Name | Type | Purpose | Value Handling |
| --- | --- | --- | --- |
| `_dnsauth.www.iceskatingrinkrentals.com` | TXT | Azure Static Web Apps validation | value not recorded |
| `iceskatingrinkrentals.com` | TXT | Azure Static Web Apps validation | value not recorded |

The validation TXT records are public DNS records, but the token values were not written to repository docs.

## Boundary

Only Cloudflare DNS records needed for Azure custom-domain validation and root/www cutover were changed. Media, MX, Microsoft 365 TXT, SPF, and autodiscover records were not changed.
