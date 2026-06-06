# Post-Cutover DNS and HTTPS Validation

Generated: 2026-06-06

## Azure

| Hostname | Azure Status |
| --- | --- |
| `iceskatingrinkrentals.com` | Ready |
| `www.iceskatingrinkrentals.com` | Ready |

## Public DNS

| Name | Public Resolution |
| --- | --- |
| `iceskatingrinkrentals.com` | Cloudflare-flattened A response to Azure Static Web Apps edge |
| `www.iceskatingrinkrentals.com` | CNAME to `happy-mud-0b375e20f.7.azurestaticapps.net`, then Azure edge chain |
| `_dnsauth.www.iceskatingrinkrentals.com` | TXT present |

## Public HTTPS

| URL | Status | Content Type | Bytes |
| --- | --- | --- | --- |
| `https://iceskatingrinkrentals.com/` | 200 | `text/html` | 119064 |
| `https://iceskatingrinkrentals.com/contact` | 200 | `text/html` | 104710 |
| `https://iceskatingrinkrentals.com/service-areas` | 200 | `text/html` | 76945 |
| `https://iceskatingrinkrentals.com/sitemap.xml` | 200 | `text/xml` | 599 |
| `https://iceskatingrinkrentals.com/robots.txt` | 200 | `text/plain` | 79 |
| `https://www.iceskatingrinkrentals.com/` | 200 | `text/html` | 119064 |
| `https://www.iceskatingrinkrentals.com/contact` | 200 | `text/html` | 104710 |
| `https://www.iceskatingrinkrentals.com/service-areas` | 200 | `text/html` | 76945 |
| `https://www.iceskatingrinkrentals.com/sitemap.xml` | 200 | `text/xml` | 599 |
| `https://www.iceskatingrinkrentals.com/robots.txt` | 200 | `text/plain` | 79 |

## Result

DNS and HTTPS production validation passed for the approved apex and `www` production hostnames.
