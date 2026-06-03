# Validation Results

Generated: 2026-06-03

## Command Results

| Validation | Result | Notes |
| --- | --- | --- |
| JSON parse validation | pass | `manifest.json` and `service-areas-normalized-candidate-import-preflight-result.json` parsed successfully. |
| Changed MJS syntax check | pass | `node --check content-review/ice-cross-page-media-slot-plan/run-cross-page-media-slot-plan.mjs` completed with exit code 0. |
| Media validation | pass | `node tools/media-validation/validate-media-fixtures.mjs` returned `ok: true`; fixture warnings were non-blocking. |
| Service-areas local import preflight | pass for local draft | Existing normalized candidate passed shape/local draft preflight with no localDraftImport blockers. CMS/static/production blockers remain intentional. |
| Design-system validation | not applicable | No homepage/contact/service-areas candidate was changed in this planning run. |
| Tailwind/navigation validation | not applicable | No candidate or frontend source was changed in this planning run. |
| Unsafe HTML/CSS/form/media/email scan | pass via preflight | Import preflight reported no unsafe payload markers for the service-areas candidate. |
| Targeted secret scan | pass | 14 generated output/report files scanned; no high-confidence secret/JWT/token hits. |
| `git diff --check` | pass | No whitespace errors detected. |
| Trailing whitespace scan | pass | 14 generated output/report files scanned; no trailing whitespace. |
| Protected/generated/raw artifact path check | pass | No protected paths or raw/generated media artifacts were introduced by this package. |
| ZIP/raw/extracted staged check | pass | Staged file count was 0; no ZIPs, raw media, or extracted inputs staged. |

## Service-Areas Preflight Notes

The local-only preflight result was written to:

`content-review/ice-cross-page-media-slot-plan/service-areas-normalized-candidate-import-preflight-result.json`

The result is valid for local draft import planning. It remains blocked for CMS import, static regeneration, and production because approval, public contact policy, and static publishing gates are intentionally unresolved.

## Guardrail Confirmation

- CMS writes: no.
- MediaAsset writes: no.
- Theme writes: no.
- Static generation: no.
- Deployment: no.
- DNS/email/provider actions: no.
- Image generation/editing: no.
- Protected config read: no.
- Roller touched: no.
