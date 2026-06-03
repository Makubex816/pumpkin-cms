# Next Import Plan

## Exact next step

Upload or bind an approved Pumpkin MediaAsset for the PPEC partner logo, then rerun this validation package and only then decide whether to run a local draft homepage import.

## Preconditions before any import

- Resolve `ppecPartnerLogo` requirement or record an explicit waiver.
- Confirm the approved PPEC URL and CTA policy remain accepted.
- Confirm public homepage email remains form-first with no public email link.
- Confirm no Theme or MediaAsset records need to be changed by the import itself.
- Obtain a fresh local admin JWT only if an import run is separately approved.

## Guardrails carried forward

- No CMS records changed.
- No API writes.
- No homepage import.
- No contact import.
- No /service-areas update.
- No /state-city creation.
- No Theme records changed.
- No MediaAsset records changed.
- No static generation.
- No deploy, DNS, email provider, Azure, Cloudflare, or Bluehost action.
- No email was sent.
- No image generation or image tools were used.
- No protected config was read or modified.
- No secrets, JWTs, tokens, credentials, connection strings, SMTP secrets, storage keys, or provider credentials were printed.
- Roller remains paused.

## Current validation state

- Validation status: `completed_with_blockers`
- Import readiness: `review-valid-local-draft-import-blocked-by-ppec-logo-mediaasset`
