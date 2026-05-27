# Pumpkin Page Intake Normalizer

Reusable intake normalization for review-only page inputs before they become CMS import candidates or production-bound page JSON.

The normalizer accepts imperfect sources such as Pumpkin page JSON, partial JSON, foreign builder JSON, HTML fragments, CF7-style references, media manifests, markdown sections, and unknown JSON. It either writes a Pumpkin-compatible Page candidate or returns a blocker report. Candidates are not CMS-ready until they pass the .NET Page/block contract gate and the existing design, form, media, Tailwind/navigation, and import preflight checks.

## Commands

```powershell
node tools/page-intake-normalizer/normalize-page-intake.mjs validate-fixtures
node tools/page-intake-normalizer/normalize-page-intake.mjs normalize --input content-review/ice-homepage-phase8c14-validated/proposed-homepage.normalized-candidate.json --output-dir content-review/ice-homepage-phase8c14b-normalized --label homepage --secondary-input content-review/ice-homepage-phase8c15-media-binding/proposed-homepage.media-bound-candidate.json
```

## Hard Rule

All CMS-ready, import-candidate, static source, production-bound, and generated page JSON must be generated from or validated through the .NET Page and block classes. Review-only JSON may be human edited, but it must pass this normalizer and `tools/dotnet-page-contract` before moving toward CMS import.

## Supported Inputs

- `pumpkin-page-json`
- `pumpkin-page-package-json`
- `partial-page-json`
- `foreign-builder-json`
- `html-fragment`
- `cf7-package-reference`
- `media-manifest`
- `markdown-sections`
- `unknown-json`

## Scaffold Fallback

When an input is incomplete but usable, the tool creates a conservative Ice tenant scaffold with:

- tenant, site, domain, route, slug, and canonical metadata
- review-only workflow and static publishing status
- SEO placeholders recorded as blockers, not fake visible claims
- safe customHtml blocks or structured formBlock mappings where applicable
- MediaAsset requirement objects with `mediaAssetId: null`
- blocker metadata for business values, media, approval, and preflight

The scaffold never invents phone numbers, public email addresses, business display names, service areas, MediaAsset IDs, public URLs, or target city pages.

## Future Location Pages

Future city/location generation must use the `/state-city` route pattern, for example `/fl-orlando`, `/ny-new-york`, and `/pa-philadelphia`. Routes are lowercase and hyphen-separated with state first and city second. Generated pages must pass this normalizer, the .NET Page contract tool, TypeScript validators, media/form/design/Tailwind/nav/static validators, and import preflight.

