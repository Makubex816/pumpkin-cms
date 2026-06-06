# Canonical and Redirect Result

Generated: 2026-06-06

## Result

| Area | Result |
| --- | --- |
| apex host | serves 200 |
| `www` host | serves 200 |
| cross-host redirect | none configured in this cutover |
| canonical host | `https://iceskatingrinkrentals.com` |
| sitemap host | `https://iceskatingrinkrentals.com` |
| robots sitemap host | `https://iceskatingrinkrentals.com` |

## Page Canonicals

| URL Checked | Canonical |
| --- | --- |
| `https://iceskatingrinkrentals.com/` | `https://iceskatingrinkrentals.com/` |
| `https://iceskatingrinkrentals.com/contact` | `https://iceskatingrinkrentals.com/contact/` |
| `https://iceskatingrinkrentals.com/service-areas` | `https://iceskatingrinkrentals.com/service-areas/` |
| `https://www.iceskatingrinkrentals.com/` | `https://iceskatingrinkrentals.com/` |
| `https://www.iceskatingrinkrentals.com/contact` | `https://iceskatingrinkrentals.com/contact/` |
| `https://www.iceskatingrinkrentals.com/service-areas` | `https://iceskatingrinkrentals.com/service-areas/` |

## Decision

The approved cutover did not include a static deployment, redirect-rule change, Cloudflare redirect rule, or Function/config change. Therefore the production outcome is canonical-only rather than forced redirect from `www` to apex.

Future redirect enforcement would require separate explicit approval.
