# Ice CMS Import-Ready Input Request

## Purpose

This is the final blocker-resolution checklist for making the IceSkatingRinkRentals.com homepage, contact page, and service areas page CMS-import-ready.

RollerRinkRentals.com remains paused.

No CMS records were changed. No MediaAsset records were created. No static packages were regenerated. No Azure, Cloudflare, DNS, deployment, workflow, or protected config action was performed.

## Current Readiness State

- Ready for human review: yes
- Ready for CMS import: no
- Ready for local CMS draft import: no, pending explicit authorization and preflight
- Ready for static regeneration: no
- Ready for production/indexing: no

Current validated sources:

- Homepage media-selected candidate: `content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json`
- Homepage upload/selection manifest: `content-review/ice-homepage-media-upload-selection/homepage-media-upload-manifest.json`
- Approval-resolution package: `content-review/ice-launch-phase8c13-approval-resolution/`
- Homepage intake package: `content-review/ice-homepage-phase8c14-validated/`

The homepage candidate is .NET-contract-valid. All homepage `mediaAssetId` values remain `null`.

## Exact Inputs Needed

Provide or approve the items below before CMS import can be considered.

### Business Values

- Final public phone
- Whether phone displays publicly on the site
- Final public email
- Whether email displays publicly or remains form-only
- Legal/business display name
- Primary service area wording
- Primary region wording
- Final quote CTA wording
- Approval for `/service-areas` as the canonical service-area route
- Confirmation that `/state-city` remains the future city-page route format

### Media Files

Place approved raw homepage media files in:

```text
content-review/ice-homepage-media-input/
```

Expected filenames:

```text
CorporateIceRinkRentalEvent.png
HolidayIceRink.png
IceRinkRentalsSetup.png
IceSkatingRinkRentalsLogo.png
WinterFestIceRinkRentals.png
```

Also provide:

- approval for each image assignment
- approved alt text for each image
- approval to create local MediaAsset records when raw files are supplied
- any additional contact page media or approval to defer/remove those media slots
- any additional service areas page media or approval to defer/remove those media slots

### Required Approvals

- Homepage copy approval
- Homepage design approval
- Contact page form approval
- Contact page copy approval
- Service areas copy approval
- SEO/meta approval
- Schema approval
- Media approval
- Phone/email policy approval
- Approval to run admin import/export preflight

## CMS Import Blockers

- Real MediaAsset upload/selection is not complete.
- Phone/email display policy is not approved.
- Legal/business display name is not approved.
- Primary service-area wording is not approved.
- Primary region wording is not approved.
- Human approvals are not recorded.
- Admin import/export preflight has not been run.

## Next Step After Inputs Are Supplied

Once the business values, raw media files, media assignments, and approvals are supplied, the next step is:

1. Execute MediaAsset upload/selection for Ice homepage media.
2. Bind real MediaAsset IDs into the homepage candidate.
3. Resolve approved business/contact values in the three-page package.
4. Run .NET contract validation, media/design/form/navigation validation, unsafe scans, and targeted secret scans.
5. Run admin import/export preflight.

CMS writes remain blocked until those steps pass and import is explicitly authorized.

## Handoff Folder

Detailed checklists are in:

```text
content-review/ice-import-readiness-input-request/
```

