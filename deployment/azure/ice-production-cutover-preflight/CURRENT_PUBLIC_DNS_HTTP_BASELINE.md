# Current Public DNS And HTTP Baseline

Generated: 2026-06-06

## Public DNS

Observed public resolution:

| Name | Type | Value |
| --- | --- | --- |
| `iceskatingrinkrentals.com` | A | `66.81.203.198` |
| `www.iceskatingrinkrentals.com` | A | `66.81.203.198` |
| `media.iceskatingrinkrentals.com` | A/AAAA | Cloudflare edge addresses |
| `autodiscover.iceskatingrinkrentals.com` | CNAME chain | Microsoft/Outlook autodiscover |
| `iceskatingrinkrentals.com` | MX | `iceskatingrinkrentals-com.mail.protection.outlook.com` |
| `iceskatingrinkrentals.com` | TXT | Microsoft 365 verification and SPF present |

## Public HTTPS

| URL | Result |
| --- | --- |
| `https://iceskatingrinkrentals.com` | unable to connect |
| `https://www.iceskatingrinkrentals.com` | unable to connect |
| `https://happy-mud-0b375e20f.7.azurestaticapps.net` | 200 |
| known `media.iceskatingrinkrentals.com` image | 200, image served through Cloudflare |

## Staging Route Baseline

| URL | Status | Canonical | Noindex |
| --- | --- | --- | --- |
| `https://happy-mud-0b375e20f.7.azurestaticapps.net/` | 200 | `https://iceskatingrinkrentals.com/` | false |
| `/contact` | 200 | `https://iceskatingrinkrentals.com/contact/` | false |
| `/service-areas` | 200 | `https://iceskatingrinkrentals.com/service-areas/` | false |
| `/sitemap.xml` | 200 | n/a | false |
| `/robots.txt` | 200 | n/a | false |

## Form OPTIONS Baseline

Safe OPTIONS checks against the static contact endpoint:

| Origin | Status | Allow-Origin |
| --- | --- | --- |
| `https://iceskatingrinkrentals.com` | 204 | `https://iceskatingrinkrentals.com` |
| `https://www.iceskatingrinkrentals.com` | 204 | `https://www.iceskatingrinkrentals.com` |
| `https://happy-mud-0b375e20f.7.azurestaticapps.net` | 204 | `https://happy-mud-0b375e20f.7.azurestaticapps.net` |

No valid form payload was submitted and no email was sent.
