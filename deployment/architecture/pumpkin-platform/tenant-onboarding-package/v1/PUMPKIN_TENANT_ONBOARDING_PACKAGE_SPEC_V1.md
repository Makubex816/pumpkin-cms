# Pumpkin Tenant Onboarding Package Spec V1

## Purpose

V1 makes tenant onboarding package-driven. A future tenant should arrive as a public package plus a separate secure handoff, then pass local validation before any live write approval is requested.

## Package Modes

`full-template` packages contain every module as files and are eligible for dry-run validation.

`retrofit-summary` packages describe an existing live tenant without copying secrets or requiring every source file to exist. Retrofit packages are evidence and gap reports, not direct import artifacts.

## Required Public Modules

- tenant
- users
- pages
- media
- theme
- forms
- contact
- importExport
- publish
- monitoring
- validation
- responsive

## Required Public Files For A Full Package

- `tenant-package.json`
- `tenant-profile.json`
- `domains.json`
- `brand.json`
- `theme.json`
- `pages/home.json`
- `pages/contact.json`
- `pages/service-areas.json`
- `forms/default-quote-request.json`
- `media/manifest.json`
- `users/admin-users.json`
- `publish/static-site.json`
- `validation/expected-routes.json`

## Responsive Readiness

Packages converted or updated after V2.8.60V must set `responsiveReadinessRequired` to `true` and include `validation/responsive-routes.json`.

Legacy normalized packages that predate V2.8.60V may still validate with a warning, but they must not proceed to isolated proof, production default-host proof, or custom-domain cutover until responsive proof exists.

`validation/responsive-routes.json` declares:

- the required viewport matrix: 360x800, 375x812, 390x844, 414x896, 430x932, 768x1024, and 1440x1200;
- the public routes selected for mobile proof;
- horizontal overflow detection;
- zero missing images;
- console and failed request expectations;
- confirmation that proof is browser/GET-only and does not submit forms.

At minimum the responsive route set must include `/`. It must also include the main contact, booking, request, package, service, or conversion route when present, plus a representative content route. If the package has many public routes, test the homepage, all critical conversion routes, and a representative sample before any production/cutover approval.

## Tenant Identity

Every module that declares `tenantId` must match `tenant-profile.json`. Tenant IDs must be lowercase kebab case.

## Pages

Minimum baseline pages are:

- `home`
- `contact`
- `service-areas`

Additional tenant pages may be included after the minimum baseline passes.

## Media

The public media manifest may reference source files by `fileRef` or `sourceRef`, but binary media does not belong in this contract folder. Actual upload artifacts must live under an ignored runtime path until a media upload phase is approved.

## Users

Public user files must include usernames/emails/roles and `passwordSource`. They must not include actual passwords.

## Forms

FormDefinition packages must include fields and routing metadata by reference only. They must not store provider keys, contact API keys, SMTP secrets, or other secret values.

## Secure Handoff

The secure handoff lives outside the repo or under an approved ignored `.tmp` path for a single phase. It may contain tenant admin passwords, tenant API keys, static-contact keys, deployment tokens, and provider secrets. Reports may mention the handoff path and non-secret readiness only.

## Execution

Package validation is a read-only local step. Tenant creation, media upload, deploy, DNS, indexing, appsettings, and secret binding require separate explicit approvals.

Responsive output proof is also read-only. It may load public pages in a browser and write local JSON evidence, but it must not submit forms, upload media, mutate content, deploy, bind DNS, or run indexing.
