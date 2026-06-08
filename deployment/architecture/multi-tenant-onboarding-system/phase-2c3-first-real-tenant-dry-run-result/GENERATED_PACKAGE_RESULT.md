# Generated Package Result

## Status

Status: `generated`

Generated local package path:

```text
deployment/architecture/multi-tenant-onboarding-system/import-package-builder/.tmp/real-dry-run-roller-rink-rentals/
```

## Generation Command

```powershell
node src/builder-cli.mjs --answers fixtures/real-dry-run-roller-rink-rentals.answers.json --out .tmp/real-dry-run-roller-rink-rentals --overwrite --validate --support-packet
```

## Result

| Area | Result |
| --- | --- |
| Files planned | 13 |
| Files written | 13 |
| Generated pages | home, contact, service-areas |
| Approved routes | `/`, `/contact/`, `/service-areas/` |
| Forbidden routes | `/preview/`, `/draft/`, `/old-roller-rink-rentals/`, `/old/` |
| Media refs | `hero-roller-rink` |
| Form refs | `contact-form -> roller-rink-leads` |
| Form delivery | `no-email` |
| Robots | `noindex,nofollow` |
| Sitemap | disabled until final gate |

## Generated Files

- `README.md`
- `manifest.json`
- `tenant.json`
- `site.json`
- `routes.json`
- `pages/home.json`
- `pages/contact.json`
- `pages/service-areas.json`
- `media-assets.json`
- `forms.json`
- `seo.json`
- `theme.json`
- `redirects.json`

## Boundary Result

The package is local ignored output. It was not staged and does not create, publish, deploy, import, index, or email anything.
