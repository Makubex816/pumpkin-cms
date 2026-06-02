# Pumpkin Ice Homepage Business Contact Policy Report

Date: June 2, 2026

## Scope

Create a business/contact policy package for the IceSkatingRinkRentals.com homepage candidate so local draft import readiness can be assessed without CMS writes. RollerRinkRentals.com remains paused.

## Start State

`git status --short --untracked-files=all` at task start was clean.

Recent git log reviewed:

```text
dfe4f90 Bind Ice homepage MediaAsset records
faf5986 Add Ice homepage MediaAsset binding blocker report
895f914 Add safe local homepage import preflight runner
c6e6382 Add Ice homepage local CMS preview readiness report
0b7345f Add Ice local preview readiness package
2ecd323 Update Microsoft 365 operational verification docs
9f31719 Record confirmed Microsoft 365 mailbox verification
10393b7 Add Microsoft 365 operational email verification package
5f86906 Add Microsoft 365 email provider selection readiness
218f4ca Select Microsoft 365 Exchange Online for Ice email readiness
3792044 Update Ice homepage media upload selection manifest
910971c Add email infrastructure readiness system
```

Protected config was not read or modified.

## Reviewed Context

- `PUMPKIN_ICE_HOMEPAGE_MEDIAASSET_CREATION_BINDING_REPORT.md`
- `content-review/ice-homepage-mediaasset-bound/`
- `PUMPKIN_ICE_HOMEPAGE_IMPORT_PREFLIGHT_REPORT.md`
- `deployment/email/` and Microsoft 365 operational verification docs
- `tools/import-preflight/README.md`
- `tools/dotnet-page-contract/README.md`

## Files Changed

- `content-review/ice-homepage-business-contact-policy/README.md`
- `content-review/ice-homepage-business-contact-policy/BUSINESS_VALUES_RESOLUTION.md`
- `content-review/ice-homepage-business-contact-policy/PHONE_NUMBER_AUDIT.md`
- `content-review/ice-homepage-business-contact-policy/EMAIL_DISPLAY_POLICY_DECISION.md`
- `content-review/ice-homepage-business-contact-policy/SERVICE_AREA_WORDING_REVIEW.md`
- `content-review/ice-homepage-business-contact-policy/HOMEPAGE_IMPORT_APPROVAL_GATE.md`
- `content-review/ice-homepage-business-contact-policy/HOMEPAGE_BUSINESS_READY_CANDIDATE.json`
- `content-review/ice-homepage-business-contact-policy/homepage-business-ready-package.json`
- `content-review/ice-homepage-business-contact-policy/homepage-business-ready-import-preflight-result.json`
- `content-review/ice-homepage-business-contact-policy/manifest.json`
- `PUMPKIN_ICE_HOMEPAGE_BUSINESS_CONTACT_POLICY_REPORT.md`

## Business Values

- Business display name resolved as `Ice Rink Rentals`.
- Legal/business display name recorded as `Ice Rink Rentals`.
- Existing visible brand/domain wording was preserved where already present.
- Internal service area recorded as `United States` / domestic USA.
- Future city route format recorded as `/state-city`; no city page was created.

## Phone Number Audit

No approved Ice public phone number was found in reviewed homepage artifacts. The candidate keeps `domainRouting.primaryPhone` empty. Before CMS import, approve a final public phone number or approve intentional no-public-phone display.

## Email Display Policy

`contact@iceskatingrinkrentals.com` is recorded as the selected mailbox for future Ice email operations. The homepage remains form-first: public email routing fields stay empty, `mailtoLinksEnabled` remains `false`, and Pumpkin app sending remains dry-run/not configured.

## Service Area

The candidate records `United States` as a disabled service schema area served object. Public service schema remains disabled until customer-facing service-area wording is approved.

## Candidate Changes

- Added business/contact policy status under review metadata.
- Updated email provider status to `microsoft-365-exchange-online-plan-1` while keeping app send disabled/dry-run.
- Preserved empty public email and phone fields.
- Added internal domestic USA service scope with public schema disabled.
- Removed stale media-not-selected warning from page quality by replacing it with current business/contact blockers.
- Preserved route `/`, canonical `https://iceskatingrinkrentals.com/`, MediaAsset bindings, semantic classes, section variants, and Pumpkin default quote form mapping.

## Readiness Classification

- Ready for human review: yes
- Ready for CMS import: no
- Ready for local CMS draft import: maybe, only with explicit user authorization and review of remaining policy blockers
- Ready for static regeneration: no
- Ready for production/indexing: no

## Blockers Before CMS Import

- Final phone number or approved no-public-phone decision is unresolved.
- Public email display policy is under review; form-first is recommended for launch.
- Customer-facing service-area wording needs user confirmation.
- Human approval is not recorded.
- `workflow.approvedForImport` is not true.
- `pageQuality.blockingIssues` intentionally remains populated.

## Safety Confirmation

No CMS Page records were changed. No CMS Theme records were changed. No contact or service-area page records were changed. No MediaAsset records were created or modified. No production static package was regenerated. No deployment, Azure, Cloudflare, DNS, Microsoft 365, or Bluehost action was performed. No real email was sent. No protected config was read or modified. RollerRinkRentals.com remains paused.

## Checks Run

- JSON parse validation passed for `HOMEPAGE_BUSINESS_READY_CANDIDATE.json`, `homepage-business-ready-package.json`, and `manifest.json`.
- `.NET validate-page` passed with `Ok: true`, 0 errors, and 5 expected review-only metadata warnings.
- `.NET validate-package` passed with `Ok: true`, 1 page file, and 0 errors.
- Local import preflight passed shape and local draft import classification; CMS import remains blocked by approval plus phone/public-email policy.
- Focused route/canonical/form/media audit passed.
- Public email fields remain empty and `mailtoLinksEnabled` remains false.
- `domainRouting.primaryPhone` remains empty; no fake phone was inserted.
- Required MediaAsset-backed media requirements remain bound with 0 missing MediaAsset ids.
- Design-system fixture validation passed: 28 passed, 0 failed.
- Default form fixture validation passed: 21 passed, 0 failed.
- Media fixture validation passed with the existing media-validation warning class: 0 failures.
- Tailwind/navigation validation passed with 37 selectors and routes `/`, `/service-areas`, `/contact`.
- Page intake normalizer fixture validation passed: 16 passed, 0 failed.
- Unsafe HTML/CSS/form/media/email scan passed through import preflight.
- Direct trailing whitespace scan passed for changed text/JSON files.
- Protected config/workflow/generated-folder check passed.
- Raw media/ZIP status check passed.
- No files are staged.
- Targeted secret scan passed.
- `git diff --check` passed.

Known warnings:

- Import preflight still reports three existing `sectionScopedCss` scope warnings from the source homepage candidate.
- `.NET` reports expected review-only metadata warnings for fields such as `reviewMetadata`, `mediaRequirements`, and `designSystem`.

## Expected Decision

- ready for business/contact human review: yes
- ready for CMS import: no
- ready for local CMS draft import: maybe, only after explicit authorization
- ready for static regeneration: no
- ready for production/indexing: no
