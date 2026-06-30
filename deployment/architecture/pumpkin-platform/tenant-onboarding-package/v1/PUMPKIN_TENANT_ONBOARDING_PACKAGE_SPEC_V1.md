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
