# Next Reimport Plan

This run deliberately did not reimport `/` or `/contact` and did not write CMS records. A future reimport can proceed only after the repaired API/tooling is the code being used by the local import path.

## Preconditions

1. Confirm the working tree changes in this repair are acceptable.
2. Rebuild or restart the local API/import process so it uses the repaired models, guard, and contract validation.
3. Re-run the updated import preflight for both candidate files and confirm both still pass shape and local draft import classification.
4. Keep the operation local-draft only. Do not promote to CMS import or production.

## Proposed Future Commands

These are documentation-only in this run; they were not executed as write/import commands.

- Re-run homepage preflight against `content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json`.
- Re-run contact preflight against `content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json`.
- Run the local draft import only after the API process is rebuilt/restarted.
- Read back both pages and compare them against this audit before doing anything else.

## Must Not Change During Reimport

- `/service-areas`
- Theme records
- MediaAsset records
- Static generation/deployment artifacts
- DNS/email/provider configuration
- Protected config
- Roller
