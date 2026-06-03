# PPEC Disconnect Decision

## Decision

Local draft import is blocked or conditional until the PPEC logo MediaAsset requirement is resolved or explicitly waived.

## Reason

The Phase 8K approved homepage includes PPEC logo treatment and source image files. The current official media manifest does not provide a Pumpkin MediaAsset id for the PPEC logo, and this run is not allowed to create or update MediaAsset records.

## Requirement

- Required slot: `ppecPartnerLogo`
- Source file: `ppec-wordmark-card.png`
- MediaAsset id: `null`
- Status: `needs-upload`
- Required before production: yes

## Validation status

- Validation state: `completed_with_blockers`
- Import readiness: `review-valid-local-draft-import-blocked-by-ppec-logo-mediaasset`
