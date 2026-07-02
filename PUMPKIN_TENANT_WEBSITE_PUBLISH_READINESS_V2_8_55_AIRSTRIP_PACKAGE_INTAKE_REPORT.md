# Pumpkin Tenant Website Publish Readiness V2.8.55 Airstrip Package Intake Report

Status: validation_passed_airstrip_package_intake_no_live_mutation

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness

Classification: airstrip_partner_package_intake_rendering_feasibility_no_live_mutation

Target domain: `airstripclublasvegas.com`

## Scope

V2.8.55 inspected the active partner package candidate at `C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\TRUENewestTenant\newest upload package` without moving, deleting, modifying, staging, building, installing dependencies, executing package scripts, uploading media, creating tenants, deploying, or mutating live systems.

## V2.8.54G Carryforward

- Airstrip is hard-locked as the next true tenant target.
- `strip-club-near-me-vegas` is not approved for live creation unless explicitly reconfirmed.
- Exact frontend rendering must be proven before tenant creation.
- Admin UI cleanup, backup gap closure, resource cleanup proof, and owner-decision worktree actions remain separate future lanes.

## Package Inventory Summary

The package path exists and is a directory containing two files:

| file | size | classification |
| --- | ---: | --- |
| `pumpkinairstrip.zip` | 4,134,050 bytes | active source package archive |
| `Screenshot 2026-07-02 175642.png` | 51,956 bytes | domain/order evidence screenshot |

Archive SHA-256: `3BF93C6B016EB2AA0CAA802CC52B0F9EF133AA9FAE44AD59BC06BE70B6F579F0`

Screenshot SHA-256: `8325120BA341119825CCB727356A6A3BF65630AC9DF4D6301FEA9376CD0622C6`

ZIP inventory: 355 file entries, 5 directory entries, 4,746,355 uncompressed bytes.

## Framework Detection

Package shape: mixed source package.

Detected:

- Next.js app router source under `pumpkinairstrip/apps/airstrip-frontend`.
- NPM package manager evidence through `package.json` and `package-lock.json`.
- Build scripts: `next build`, `next start --port 3001`, `next dev --port 3001`, `next lint`, `tsc --noEmit`, and a seed script.
- Local bundled packages: `pumpkin-block-views` and `pumpkin-ts-models`, each with TypeScript build artifacts and source.
- Tailwind, PostCSS, TypeScript, Next config, and app routes.

Not detected:

- No static HTML output.
- No `out/` static export.
- No app-level `dist/` static site output.
- No V2.8.50 tenant onboarding contract folder.

## Rendering Feasibility Decision

Decision: `hybrid`

Reason: the package is a source-build Next app with Pumpkin model/view helpers and package-specific assets, not a static passthrough artifact and not a complete Pumpkin tenant package contract. Exact visual rendering may be feasible after a future isolated source-build proof, but live Pumpkin onboarding still requires conversion/mapping into tenant profile, domains, pages, media, theme, forms, publish, users, and validation modules.

No install, build, script execution, or network package resolution was run in V2.8.55.

## Route And Page Mapping

Detected 25 app page routes including `/`, `/airstrip-the-club`, `/packages`, `/request-booking`, `/custom-request`, `/bachelor-parties`, `/birthdays`, `/corporate`, `/couples`, package detail pages, legal pages, news pages, `/booking-confirmed`, and a catch-all route.

Pumpkin baseline mapping:

- Home: mappable from `src/app/page.tsx`.
- Contact: no direct `/contact`; likely requires mapping `/request-booking` and/or `/custom-request`.
- Service areas or clubs equivalent: likely `/airstrip-the-club` and package pages, but owner should confirm.
- Additional pages: preserve as extra page routes after baseline mapping passes.

## Media Inventory

ZIP media assets: 13 files.

- 10 JPG files.
- 2 SVG logo files.
- 1 PNG file.
- No video/font files detected in the ZIP.

Largest package media assets include `fathers-day-thumb.png`, `pkg-skyline.jpg`, `pkg-cabin.jpg`, `pkg-duo.jpg`, `pkg-onehour.jpg`, `pkg-champagne.jpg`, `pkg-party-10.jpg`, and `pkg-throttle.jpg`.

These should become a future media manifest and approved upload batch; no media upload occurred.

## Forms And Contact

Detected reservation/lead flow:

- Form route: `/request-booking`.
- Confirmation route: `/booking-confirmed`.
- Field names detected: `name`, `email`, `phone`, `date`, `time`, `guests`, `pickup`, and `requests`.
- Submit endpoint pattern: `/api/forms/airstrip/submit/airstrip-reservation`.
- Runtime env names referenced by source: `NEXT_PUBLIC_API_URL`, `PUMPKIN_API_KEY`, and `PUMPKIN_TENANT_ID`.

This is not a simple static contact replacement. It should map to a tenant-scoped FormDefinition plus compatible submit/readback routes in a future controlled phase.

## Brand And Theme

Detected theme file: `src/data/airstrip-theme.json`.

Theme summary:

- Theme name: Airstrip Las Vegas Dark.
- Tenant ID in package: `airstrip`.
- Colors detected: `#0a0a0a`, `#121212`, `#2a2a2a`, `#a1a1a1`, `#ef5392`, `#f5f5f5`.
- Logo files: `logo-full.svg`, `logo-wordmark.svg`.
- Visual direction: dark luxury theme with pink accent.

The package mentions `www.airstriplasvegas.com`, while the hard-locked target is `airstripclublasvegas.com`. Domain and tenant ID normalization is required.

## Protected Config And Secret Scan

Protected/config-looking file name detected:

- `pumpkinairstrip/apps/airstrip-frontend/.env.example`

The contents of `.env.example` were not printed. Secret-like identifiers were detected in text/source paths, primarily env names, model fields, and seed/API references. No secret values were written to reports.

Classification: `contains_config_template_and_secret_like_identifiers_secure_handoff_required`

## Pumpkin Package Mapping

The ZIP does not contain the required V2.8.50 full-template package files:

- `tenant-package.json`
- `tenant-profile.json`
- `domains.json`
- `brand.json`
- `theme.json`
- baseline `pages/*.json`
- `forms/default-quote-request.json`
- `media/manifest.json`
- `users/admin-users.json`
- `publish/static-site.json`
- `validation/expected-routes.json`

Equivalent source material exists for pages, media, theme, and a reservation form, but it must be normalized into the Pumpkin contract before any creation preflight.

## Gaps

Highest-priority gaps:

- Domain mismatch: package code mentions `www.airstriplasvegas.com`, target is `airstripclublasvegas.com`.
- Tenant ID mismatch/normalization: package uses `airstrip`; target tenant ID must be chosen and applied consistently.
- No static export: exact rendering requires future isolated source-build proof.
- No V2.8.50 tenant package contract files.
- Form endpoint requires FormDefinition and secure API key handoff.
- `.env.example` and secret-like identifiers require secure handoff handling.
- Admin users and publish/validation metadata are missing.

## Recommended Next Path

1. Run V2.8.55A isolated Airstrip source-build/render proof in ignored workspace only.
2. If build succeeds, capture local screenshots and route coverage without deployment.
3. Normalize target domain and tenant ID.
4. Generate a V2.8.50-compatible package draft from the source package.
5. Run validator and gap closure.
6. Only after approval, request controlled Airstrip tenant creation preflight.

## Security Boundary

No live mutation occurred. No deploy, tenant creation, Azure mutation, appsetting mutation, DNS/indexing, contact POST, form submission, media upload, package source modification, package script execution, dependency install, protected config value printing, hard-copy read, key/listKeys/SAS/connection string operation, `.tmp` staging, package staging, binary media staging, or `git add -A` occurred.
