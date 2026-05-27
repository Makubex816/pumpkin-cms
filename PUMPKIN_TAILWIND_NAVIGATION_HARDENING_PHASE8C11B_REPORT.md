# Pumpkin CMS Phase 8C.11B Report

## Scope

Phase 8C.11B hardened the IceSkatingRinkRentals.com CMS design pipeline against Tailwind dynamic class misses and clarified navigation source behavior before any CMS import.

IceSkatingRinkRentals.com remains the primary launch focus. RollerRinkRentals.com remains paused.

No CMS pages or themes were imported or updated. No production static packages were regenerated. No Azure, Cloudflare, DNS, deployment, workflow, protected config, or Roller work was performed.

## Start State

- Branch: `feature/admin-page-editor-import-export`
- `git status --short --untracked-files=all` at start: clean
- Recent head: `5e0be5d Add Phase 8C.11 production default contact form system`
- Phase 8C.11 report was present in the committed tree.
- Phase 8C.11-QA report was present in the committed tree.
- No files were staged at start.

## Tailwind Assessment

The Ice Next.js Tailwind config scans source-controlled frontend and block-renderer code:

- `apps/ice-rink-web/src/**/*.{js,ts,jsx,tsx,mdx}`
- `packages/pumpkin-block-views/src/**/*.{ts,tsx}`

It does not scan CMS JSON, review bundles, import-candidate JSON, snapshots, or generated packages. This means Tailwind utility classes embedded directly in CMS-authored JSON can be missed by the Tailwind build.

That risk is now handled as an explicit rule:

- CMS-authored `customHtml` and page JSON should use approved semantic classes, section variants, or validated `sectionScopedCss`.
- Arbitrary Tailwind utility-looking classes in CMS HTML or CMS-authored CSS are blocking validation errors unless explicitly registered.
- Source-controlled Tailwind usage remains allowed in React components, package block views, fallback theme class maps, and source CSS.

## CMS Class Audit

The Phase 8C.10 Ice import-candidate templates were scanned for CMS HTML classes.

Classes found:

- `cms-copy`
- `cms-eyebrow`
- `cms-layout`
- `cms-panel`
- `ice-alias-note`
- `ice-area-card`
- `ice-area-grid`
- `ice-check-list`
- `ice-city-note`
- `ice-cta-link`
- `ice-details-list`
- `ice-event-card`
- `ice-event-grid`
- `ice-hero-grid`
- `ice-planning-table`
- `ice-privacy-note`
- `ice-quote-grid`
- `ice-region-list`
- `ice-response-note`
- `ice-service-teaser`

Result: no CMS/page JSON Tailwind utility dependency was found in the current Ice import-candidate package. The classes are semantic CMS/Ice classes under the approved prefixes.

## CSS Architecture Decision

Semantic CMS classes and section variants are now backed by source CSS in `apps/ice-rink-web/src/app/globals.css`, so they do not depend on Tailwind discovering CMS JSON.

Verified source CSS coverage now includes:

- Shared classes: `cms-`, `section-`, `rich-`
- Ice classes: `ice-`
- Trusted embed wrappers
- Rich HTML wrappers
- Required launch section variants
- Form-related variants: `quote-form-panel`, `contact-card`, `inline-contact`, `compact-contact`

No Tailwind safelist was added because this phase avoids CMS JSON utility classes rather than preserving them. Source-controlled `@apply` and package-renderer class strings remain visible to Tailwind through configured scan paths.

## Validator Changes

TypeScript validator changes:

- Added Tailwind utility-looking class detection.
- `customHtml` class attributes now block unregistered Tailwind utility-looking classes.
- CMS-authored CSS selectors now block unregistered Tailwind utility-looking classes.
- Added navigation validation helpers and Ice launch route constants.
- Added form/contact variants to the section variant registry so section and form variant names stay aligned.

.NET/API validator changes:

- Mirrored Tailwind utility-looking class detection.
- `customHtml` class attributes now block unregistered Tailwind utility-looking classes.
- CMS-authored CSS selectors now block unregistered Tailwind utility-looking classes.
- Added theme navigation validation for labels, URLs, targets, and Ice launch route warnings.
- Added form/contact variants to the API section variant registry.

Static/snapshot validator changes:

- `static-publish.mjs` now validates theme navigation.
- `snapshot-cms-content.mjs` now validates theme navigation.
- Ice theme navigation warnings are surfaced when the theme menu does not include `/`, `/service-areas`, and `/contact`.

Admin changes:

- Theme editor save now validates navigation.
- Menu validation errors block save.
- Menu validation warnings are shown in the Menu tab.
- Ice theme menu validation uses the expected launch routes: `/`, `/service-areas`, `/contact`.

## Ice Template Cleanup Result

No Ice import-candidate template cleanup was required.

The current templates already avoid raw Tailwind utility classes in CMS `customHtml`. Styling is supplied through approved semantic classes and scoped CSS.

Verified:

- Homepage template is not Tailwind-runtime dependent.
- Contact template is not Tailwind-runtime dependent.
- Service Areas template is not Tailwind-runtime dependent.
- `formBlock` styling remains source-controlled in package block views.
- `customHtml` styling uses semantic classes and scoped CSS.
- No raw `<style>` tags or inline style attributes were added.

## Block Contract Alignment

Affected block types reviewed:

- `customHtml`
- `trustedEmbed`
- `formBlock`
- rich/design-system sections
- section variants
- theme navigation/menu

Alignment result:

- .NET models exist for `customHtml`, `trustedEmbed`, `formBlock`, Theme design system, and Theme menu.
- TypeScript models/types exist for `customHtml`, `trustedEmbed`, `formBlock`, Theme design system, and Theme menu.
- .NET and TypeScript validators now both reject unregistered Tailwind utility-looking classes in CMS-authored HTML/CSS.
- Admin Page Editor support remains in place for `customHtml`, `trustedEmbed`, and `formBlock`.
- Admin Theme Editor supports menu editing and now validates navigation.
- Public renderer/package block views continue rendering sanitized `customHtml`, safe `trustedEmbed`, and visible `formBlock`.
- Import/export and static/snapshot validators use the shared TypeScript validators where practical.
- Fixtures now cover Tailwind utility blocking and navigation validation.

Block mismatches found: none that required a new block type or renderer change.

Block mismatches repaired:

- Section variant registry alignment was expanded to include `contact-card`, `inline-contact`, and `compact-contact`.
- Theme navigation validation now exists in both TypeScript/static tooling and .NET API guard code.

## Navigation Assessment

Navigation is currently hybrid:

- Runtime/static header reads Theme/CMS navigation when a theme is available.
- Next.js fallback theme provides source-controlled navigation when CMS theme data is missing.
- Admin Theme Editor can edit the theme menu.
- Theme model support exists in .NET and TypeScript.

Fallback Ice navigation was updated to:

- Home: `/`
- Service Areas: `/service-areas`
- Contact: `/contact`

Future `/state-city` or other local landing pages are not required in the main navigation. They should be introduced through contextual internal links, service-area content, footer links, or approved campaign-specific navigation after the target city/state route is confirmed.

Known menu limitation:

- Existing seed/live theme menus may still contain older pre-8B routes until a later approved theme/content update. The Ice static seed validator now warns about those old routes but does not block the current non-import hardening phase.

## Files Changed

- `apps/admin/src/app/dashboard/themes/[id]/page.tsx`
- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs`
- `apps/ice-rink-web/scripts/static-publish.mjs`
- `apps/ice-rink-web/src/app/globals.css`
- `apps/ice-rink-web/src/data/fallback-theme.ts`
- `apps/pumpkin-api/Services/DesignSystemGuard.cs`
- `packages/pumpkin-ts-models/src/design-system.ts`
- `packages/pumpkin-ts-models/src/index.ts`
- `packages/pumpkin-ts-models/dist/index.*`
- `tools/design-system-validation/fixtures/rich-section-cases.json`
- `tools/design-system-validation/validate-fixtures.mjs`
- `tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs`
- `PUMPKIN_TAILWIND_NAVIGATION_HARDENING_PHASE8C11B_REPORT.md`

## Checks Run

- JSON parse validation for design fixtures and Ice import-candidate JSONs: passed
- `node tools/design-system-validation/validate-fixtures.mjs`: passed, 28 cases
- `node tools/design-system-validation/validate-tailwind-navigation-fixtures.mjs`: passed
- `node tools/default-form-validation/validate-default-form-fixtures.mjs`: passed, 21 cases
- `node tools/media-validation/validate-media-fixtures.mjs`: passed
- `node --check` for changed `.mjs` files: passed
- TypeScript model build using repo-installed TypeScript with Node type roots: passed
- `npm run type-check` in `apps/admin`: passed
- `npm run type-check` in `apps/ice-rink-web`: passed
- `npm run build` in `packages/pumpkin-block-views`: passed
- `dotnet build apps/pumpkin-api/pumpkin-api.csproj`: passed
- `npm run validate:static:ice`: passed with existing seed-content warnings, including the new expected warnings for old seed theme navigation routes.
- `git diff --check`: passed
- Direct trailing whitespace scan across tracked and untracked changed files: passed
- Protected config/workflow/generated-folder/ZIP check across tracked and untracked changed files: passed
- Targeted secret scan across tracked and untracked changed files: passed; scanner pattern definitions were treated as test/validator text, not secret values
- Staged-file check: no files staged

## Known Limitations

- The current Ice import-candidate package remains not CMS-import-ready because business values, final media, human approval, and import preflight remain unresolved.
- Existing seed/live theme menus may need a later approved theme update to match the 4-page Ice launch scope.
- The Tailwind model package build required using an installed TypeScript binary and explicit Node type roots because `packages/pumpkin-ts-models/node_modules` is not installed locally.
- No CMS write was performed, so no live menu/theme data was changed.

## Decisions

- Ice templates are now safe from silent Tailwind dynamic class misses when they follow the approved semantic-class and scoped-CSS path.
- Arbitrary Tailwind utilities in CMS JSON are not allowed silently; validators now catch them.
- Navigation behavior is acceptable before CMS import as a hybrid Theme/CMS menu with source fallback.
- The expected Ice main routes are `/`, `/service-areas`, and `/contact`.
- Future city/location pages should not be added to the main nav by default.

## Next Recommended Phase

Phase 8C.12 should resolve approved business values and media selection, then run a focused CMS import preflight against the Ice import-candidate package without writing to CMS until human approval is documented.
