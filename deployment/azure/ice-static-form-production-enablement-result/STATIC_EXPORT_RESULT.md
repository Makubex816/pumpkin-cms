# Static Export Result

Generated: 2026-06-06

## Environment Contract

Local export and validation commands used the approved endpoint contract:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```

## Official CMS-Backed Export

Command:

```text
npm run export:static:ice:cms
```

Result:

```text
passed, exit 0
```

No CMS write occurred. Protected config contents were not opened or printed.

## Fresh CMS Snapshot Generation

The fresh CMS-backed export completed after the refreshed admin auth probe returned `200`.

| Command | Result |
| --- | --- |
| `npm run snapshot:cms:ice` | passed |
| `npm run validate:snapshot:ice` | passed |
| `npm run build:static:ice:cms` | passed with warnings |
| `node scripts/static-publish.mjs generate` | passed |

Generation result:

| Metric | Result |
| --- | --- |
| `ok` | true |
| pages | `3` |
| published pages | `3` |
| snapshot slugs | `contact`, `home`, `service-areas` |
| sitemap count | `3` |
| redirects | `0` |
| output snapshot | true |

The generated output was local only. No static deployment was performed.
