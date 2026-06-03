# Ice Updated Home/Contact Contract Persistence Repair

Repair-only run completed locally. No CMS records were written, and no reimport was attempted for `/` or `/contact`. This package documents the readback stripping observed after the previous import, the contract/model repairs made to prevent another strip, and the validation status for a future local draft import attempt.

## Verdict

- Candidate JSON already contained the required homepage media, production-render fields, explicit selected mailbox, and explicit public email display policy.
- Prior readback stripped or failed to round-trip those fields.
- The .NET page contract, TypeScript model, import preflight, normalizer defaults, and design-system guard now check and preserve the updated home/contact persistence contract.
- Fresh preflight after repair passes for shape and local draft import, but remains intentionally not valid for CMS import or production because this package is review-only.
- A future reimport should use a rebuilt local API/tooling process; this run did not perform that write.

## Key Inputs

- `content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json`
- `content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json`
- `content-review/ice-updated-home-contact-local-draft-import/homepage-readback-after-import.json`
- `content-review/ice-updated-home-contact-local-draft-import/contact-readback-after-import.json`

## Generated Evidence

- `README.md`
- `STRIPPED_FIELDS_AUDIT.md`
- `HOMEPAGE_CANDIDATE_VS_READBACK.md`
- `CONTACT_CANDIDATE_VS_READBACK.md`
- `ROOT_CAUSE_ANALYSIS.md`
- `CONTRACT_REPAIR_PLAN.md`
- `ROUNDTRIP_VALIDATION.md`
- `IMPORT_PREFLIGHT_REPAIR.md`
- `NEXT_REIMPORT_PLAN.md`
- `manifest.json`
- `homepage-import-preflight-after-repair.json`
- `contact-import-preflight-after-repair.json`
- `roundtrip-validation-result.json`

## Scope Guard

No files or flows were changed for service areas, Theme, MediaAsset records, static generation, deployment, DNS, email providers, protected config, Roller, or live CMS content.
