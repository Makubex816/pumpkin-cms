# Pumpkin Package Contract Mapping

Contract reference: V2.8.50 / `deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/`

The package is not currently a valid V2.8.50 full-template package. It is a source package that must be converted.

| required module/file | package evidence | status |
| --- | --- | --- |
| `tenant-package.json` | none | missing |
| `tenant-profile.json` | source tenant ID `airstrip` in theme/env references | needs generated file |
| `domains.json` | screenshot target domain; source mentions `www.airstriplasvegas.com` | needs normalization |
| `brand.json` | logos and theme metadata | needs generated file |
| `theme.json` | `src/data/airstrip-theme.json` | convertible |
| `pages/home.json` | `src/app/page.tsx` | convertible |
| `pages/contact.json` | no direct `/contact`; `/request-booking` and `/custom-request` candidates | owner decision needed |
| `pages/service-areas.json` | no direct `/service-areas`; `/airstrip-the-club` and package pages candidates | owner decision needed |
| additional pages | 20+ app routes | convertible after baseline |
| `forms/default-quote-request.json` | reservation form source | must become Airstrip reservation FormDefinition |
| `media/manifest.json` | 13 image/logo assets | needs generated manifest |
| `users/admin-users.json` | none | secure/admin handoff needed |
| `publish/static-site.json` | none | needs generated publish plan |
| `validation/expected-routes.json` | routes detected from app | needs generated checks |

Creation readiness: not ready.

Normalization required before creation:

- Target domain: `airstripclublasvegas.com`.
- Tenant ID: owner/engineering should choose a stable lowercase kebab ID.
- Contact/reservation flow: owner should approve the baseline page and form mapping.

