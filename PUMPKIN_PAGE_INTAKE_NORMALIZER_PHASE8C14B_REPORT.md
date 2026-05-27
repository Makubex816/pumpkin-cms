# Phase 8C.14B Page Intake Normalizer / Scaffold Fallback Report

## Summary

- Primary site: IceSkatingRinkRentals.com.
- RollerRinkRentals.com status: paused; no Roller content, deployment, or planning was advanced.
- Git status at start: clean.
- Latest start-state commit reviewed: `7b6c7fe Add Phase 8C.15 Ice homepage media binding manifest`.
- CMS writes: none.
- Media uploads or MediaAsset writes: none.
- Static regeneration/deployment/DNS/Azure/Cloudflare/workflow changes: none.
- Protected config read/modified: none.

## Files Changed

- `tools/page-intake-normalizer/README.md`
- `tools/page-intake-normalizer/normalize-page-intake.mjs`
- `tools/page-intake-normalizer/fixtures/*`
- `content-review/ice-homepage-phase8c14b-normalized/README.md`
- `content-review/ice-homepage-phase8c14b-normalized/NORMALIZER_RUN_REPORT.md`
- `content-review/ice-homepage-phase8c14b-normalized/HOMEPAGE_NORMALIZATION_RESULT.md`
- `content-review/ice-homepage-phase8c14b-normalized/proposed-homepage.normalizer-verified.json`
- `content-review/ice-homepage-phase8c14b-normalized/homepage-normalizer-verified-package.json`
- `content-review/ice-homepage-phase8c14b-normalized/manifest.json`
- `PUMPKIN_PAGE_INTAKE_NORMALIZER_PHASE8C14B_REPORT.md`

## Current Capability Assessment

Before this phase, Phase 8C.14 and 8C.15 proved that a proposed homepage package could be manually normalized and then validated through the .NET Page/block contract. The missing reusable layer was an intake tool that could handle imperfect future inputs without hand-building production-bound JSON.

Phase 8C.14B adds that reusable intake normalizer and fixture suite. It does not replace the .NET Page contract gate; it feeds it.

## Tool Location

- Tool: `tools/page-intake-normalizer/normalize-page-intake.mjs`
- Docs: `tools/page-intake-normalizer/README.md`
- Fixtures: `tools/page-intake-normalizer/fixtures/`

Supported input types:

- `pumpkin-page-json`
- `pumpkin-page-package-json`
- `partial-page-json`
- `foreign-builder-json`
- `html-fragment`
- `cf7-package-reference`
- `media-manifest`
- `markdown-sections`
- `unknown-json`

## Normalization Rules

Safe normalization handles:

- optional metadata defaults
- route/path/slug/canonical normalization
- page title/meta field aliases
- loose section title/body aliases
- media references converted to MediaAsset requirement objects
- CF7-style/contact intent mapped to Pumpkin `formBlock`
- safe HTML fragments wrapped as `customHtml`
- semantic CMS classes preserved

Blocking validation handles:

- malformed JSON
- unsupported block types
- unsafe HTML/CSS/form tags
- raw form/input/button/textarea/select in `customHtml`
- base64 images
- unsafe URL schemes
- unapproved external media URLs
- fake URL-shaped `mediaAssetId` values
- secret-like values
- raw Tailwind utility-looking classes in CMS-authored HTML/CSS
- page JSON that fails .NET Page/block deserialization or validation

## Scaffold Fallback

When input is incomplete but usable, the normalizer creates an Ice tenant review-only scaffold with tenant/site/domain, route, canonical, workflow metadata, static publishing metadata, SEO review fields, content blocks, media requirements, page-quality blockers, and formBlock mapping when contact/form intent exists.

The scaffold does not invent final phone numbers, public email addresses, legal/business display names, service-area wording, MediaAsset IDs, public image URLs, or target city pages. Unknowns remain blocker metadata.

## .NET Contract Behavior

All normalized/scaffolded output is validated through:

```powershell
dotnet run --project tools/dotnet-page-contract/Pumpkin.PageContractTool.csproj -- validate-page --path <candidate>
dotnet run --project tools/dotnet-page-contract/Pumpkin.PageContractTool.csproj -- validate-package --path <folder>
```

The normalizer exits non-zero on blocking validation errors. Warnings are allowed for review-only metadata and unresolved media, but warnings do not make a package CMS-import-ready.

## TS/.NET/Block-View Alignment

Alignment remains clean across:

- .NET `HtmlBlockFactory`
- TypeScript `BLOCK_TYPE_MAP`
- package/block view renderer mappings

Verified affected block types:

- `customHtml`
- `trustedEmbed`
- `formBlock`
- existing rich/content block types used by the homepage candidate

No .NET/TS/block-view mismatch was found.

## Form Normalization

CF7-style input is reference-only. The normalizer maps form intent into Pumpkin:

- `formBlock`
- `default-quote-request`
- `quote-form-panel`
- `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- `ICE_RINK_RENTALS_LEAD_RECIPIENT`

It does not preserve WordPress shortcodes, raw form HTML, WordPress mail templates, or runtime CF7 dependencies.

## Media Normalization

Media-like inputs normalize into MediaAsset requirement objects with:

- `mediaAssetId: null` unless a real MediaAsset exists
- safe filename recommendation
- required alt text
- usage type
- upload/selection status
- blocker status

The tool does not upload media, create MediaAsset records, invent public URLs, or embed base64 image data.

## HTML/CSS Normalization

Safe HTML maps to `customHtml` and is validated through Phase 8C.5 rules. Unsafe tags/attributes and raw forms are blocked. Tailwind utility-looking classes in CMS-authored content are blocked unless registered by the design-system rules. One-off styling must remain section-scoped.

## Navigation/Route Normalization

Current Ice launch routes remain:

- `/`
- `/service-areas`
- `/contact`

`/areas-served` remains a future alias/redirect candidate only, not a canonical route.

## Future `/state-city` Rules

Future city/location pages must use:

- route pattern: `/state-city`
- examples: `/fl-orlando`, `/ny-new-york`, `/pa-philadelphia`
- lowercase
- hyphen-separated
- state first, city second
- .NET Page/block classes
- page intake normalizer
- .NET contract validation
- TypeScript/admin/public renderer compatibility
- design/media/form/Tailwind/nav/static validators
- no loose JSON or TypeScript-only generation

No city/location page was created in this phase.

## Fixtures Added

The fixture suite covers:

- valid Pumpkin page JSON
- partial page JSON scaffold
- malformed JSON blocker
- foreign builder JSON normalization
- safe HTML fragment to `customHtml`
- unsafe HTML blocker
- CF7 reference to `formBlock/default-quote-request`
- raw form HTML blocker
- media manifest to MediaAsset requirements
- base64 image blocker
- Tailwind utility class blocker
- safe semantic classes
- valid future `/state-city` route
- bad city route blocker
- unknown block type blocker
- .NET contract failure blocker

Result: 16 passed, 0 failed.

## Homepage Normalizer Run

Primary input:

- `content-review/ice-homepage-phase8c14-validated/proposed-homepage.normalized-candidate.json`

Secondary verification input:

- `content-review/ice-homepage-phase8c15-media-binding/proposed-homepage.media-bound-candidate.json`

Output:

- `content-review/ice-homepage-phase8c14b-normalized/proposed-homepage.normalizer-verified.json`
- `content-review/ice-homepage-phase8c14b-normalized/homepage-normalizer-verified-package.json`

Result:

- input type: `pumpkin-page-json`
- .NET page contract: passed
- .NET package contract: passed
- secondary Phase 8C.15 candidate .NET contract: passed
- candidate block count: 10
- media requirement count: 6
- unresolved media blockers: 6

## Readiness

- System ready to normalize future page inputs: yes.
- Homepage ready for human review: yes.
- Homepage ready for CMS import: no.
- Homepage ready for local CMS draft import: no, unless blockers are resolved and the user explicitly authorizes it.
- Homepage ready for static regeneration: no.
- Homepage ready for production/indexing: no.

Remaining homepage blockers before CMS import:

- approved MediaAsset records are still required
- public phone/email policy remains unresolved
- legal/business display name remains unresolved
- primary service-area/region wording remains unresolved
- human approvals are not recorded
- admin import/export preflight has not run against the final approved candidate

## Checks Run

- `node --check tools/page-intake-normalizer/normalize-page-intake.mjs`: passed
- `node tools/page-intake-normalizer/normalize-page-intake.mjs validate-fixtures`: passed, 16/16
- normalizer run against Phase 8C.14 homepage candidate: passed
- secondary normalizer verification against Phase 8C.15 media-bound homepage candidate: passed
- `.NET validate-page` against Phase 8C.14B homepage candidate: passed with review-only/media warnings
- `.NET validate-package` against Phase 8C.14B output folder: passed with review-only/media warnings
- `node tools/dotnet-page-contract/validate-contract-alignment.mjs`: passed
- `node tools/design-system-validation/validate-fixtures.mjs`: passed, 28/28
- `node tools/default-form-validation/validate-default-form-fixtures.mjs`: passed, 21/21
- `node tools/media-validation/validate-media-fixtures.mjs`: passed with expected warning coverage
- `node tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs`: passed
- JSON parse validation for new output JSON and fixture manifests: passed
- unsafe HTML/CSS/form/media scan against new homepage output: no matches
- targeted secret scan: no secret values found
- `dotnet build tools/dotnet-page-contract/Pumpkin.PageContractTool.csproj`: passed
- `git diff --check`: passed
- direct trailing whitespace scan: passed across 27 changed/untracked files
- protected config/workflow/generated-folder/raw-media check: passed
- no files staged: passed
- no ZIP or raw image media files staged: passed

## Known Limitations

- The normalizer is a conservative intake and blocker-report tool, not a CMS writer.
- It does not upload media or create MediaAsset records.
- It does not run admin import/export preflight.
- It does not make unresolved business values production-safe.
- Review-only metadata remains outside the canonical .NET Page model and is reported as non-blocking .NET warnings.

## Next Recommended Phase

Resolve the remaining Ice homepage blockers: approved business values, MediaAsset upload/selection, human approval, and admin import/export preflight. After that, use the .NET Page contract tool and normalizer as gates before any CMS import.
