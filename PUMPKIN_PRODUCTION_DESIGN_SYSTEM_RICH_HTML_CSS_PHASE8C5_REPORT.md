# Pumpkin CMS Phase 8C.5 - Production Design System + Rich HTML/CSS Section System

Date: 2026-05-26

Branch: `feature/admin-page-editor-import-export`

## Summary

Phase 8C.5 added a validator-backed design-system and rich-section workflow for CMS-authored page JSON.

Primary launch focus remains IceSkatingRinkRentals.com.

RollerRinkRentals.com remains paused. This phase preserved multi-tenant architecture support but did not advance Roller content, deployment, or launch planning.

No CMS content was rewritten. No CMS page or theme data was patched. No static packages were regenerated. No Azure, Cloudflare, DNS, workflow, protected config, or deployment action was performed.

## Starting State

`git status --short --untracked-files=all` was clean at the start of Phase 8C.5.

Latest commits reviewed:

- `f45082d Add Phase 8B Ice 4-page launch scope report`
- `31e58fd Add Phase 8A Azure default-host staging gate report`
- `5d1dcf3 Add Phase 7K final static regeneration rescan report`

Phase 8B report status:

- `PUMPKIN_ICE_4PAGE_LAUNCH_SCOPE_PHASE8B_REPORT.md` exists and was already committed.

## Project State Reviewed

Reviewed implementation seams:

- Admin page editor: `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
- Admin block editor: `apps/admin/src/components/blocks`
- Admin import/export preflight: `apps/admin/src/app/dashboard/pages/import-export/page.tsx`
- Admin theme editor: `apps/admin/src/app/dashboard/themes/[id]/page.tsx`
- Public page renderer: `apps/ice-rink-web/src/components/PageRenderer.tsx`
- Public theme/layout rendering: `apps/ice-rink-web/src/app/layout.tsx`
- Static snapshot/export validators: `apps/ice-rink-web/scripts`
- Static package validators: `deployment/static-azure`
- API page/theme write endpoints: `apps/pumpkin-api/Program.cs`, `apps/pumpkin-api/Managers/PumpkinManager.cs`
- .NET page/theme models: `apps/pumpkin-net-models/Models`
- TS models and block renderer packages: `packages/pumpkin-ts-models`, `packages/pumpkin-block-views`

Assessment before implementation:

- Existing system had tenant-separated rendering, CMS-backed pages/themes, static export, admin page/theme editors, media support, import/export, and validators.
- It did not yet have one first-class contract for controlled custom HTML, controlled scoped CSS, tenant/domain design tokens, approved section variants, trusted embeds, class registry warnings, and write-time validation.

## Files Changed

Primary new implementation:

- `packages/pumpkin-ts-models/src/design-system.ts`
- `packages/pumpkin-block-views/src/views/CustomHtmlBlockView.tsx`
- `packages/pumpkin-block-views/src/views/TrustedEmbedBlockView.tsx`
- `apps/ice-rink-web/src/components/DesignSystemStyles.tsx`
- `apps/pumpkin-api/Services/DesignSystemGuard.cs`
- `apps/pumpkin-net-models/Models/CustomHtmlBlock.cs`
- `apps/pumpkin-net-models/Models/TrustedEmbedBlock.cs`
- `tools/design-system-validation/fixtures/rich-section-cases.json`
- `tools/design-system-validation/validate-fixtures.mjs`

Key updated surfaces:

- TS/.NET Theme and block models
- API admin/public page and theme write validation paths
- Admin page/theme editors and import preflight
- Public frontend layout/page rendering
- Static snapshot/export/package validators
- Local fixture validation tests

## Design System Support

Theme tokens:

- Added structured `designSystem.tokens` support for colors, typography, spacing, layout, container widths, border radius, buttons, cards, hero sections, CTA bands, forms, FAQ blocks, media blocks, tables, shadows, and backgrounds.
- Frontend renders tokens as tenant-scoped CSS variables under `[data-tenant-id="<tenant>"]`.

Domain CSS:

- Added `designSystem.domainCss`.
- Validation requires tenant/domain scoping such as `[data-tenant-id="ice-rink-rentals"]`.
- Global `html`, `body`, `#__next`, unsafe URL schemes, `@import`, unsafe `@font-face`, and script-like CSS are blocked.

Template CSS / section variants:

- Added approved variants: `premium-hero`, `split-feature`, `trust-band`, `event-card-grid`, `service-area-grid`, `quote-form-panel`, `faq-panel`, `media-feature`, `table-comparison`, `final-cta`.
- Template CSS is validated and expected to map to approved section variant selectors.

Section scoped CSS:

- Added optional `customHtml.content.css`.
- CSS must be scoped to the specific section wrapper, for example `[data-section-id="quote-panel"]`.
- Unsafe or global selectors are blocked.

Approved class registry:

- Shared allowed prefixes: `cms-`, `section-`, `card-`, `cta-`, `trust-`, `grid-`, `media-`, `rich-`, `ice-`.
- Unknown class names warn in HTML/CSS validation.

## Rich Sections

`customHtml` support:

- Section fields: `id`, `label`, `html`, `container`, `allowedProfile`, `sectionVariant`, optional `css`, `sanitize`, review metadata, validation metadata.
- Containers: `standard`, `wide`, `fullBleed`, `none`.
- Renderer sanitizes HTML before `dangerouslySetInnerHTML`.
- Renderer applies scoped CSS only after validation passes.
- Invalid sections fail closed with a small unavailable placeholder.

`trustedEmbed` support:

- Fields: `provider`, `url`, `title`, `aspectRatio`, `caption`, `container`, review metadata, validation metadata.
- Providers: `youtube`, `vimeo`, `googleMaps`.
- Raw iframe HTML remains blocked in `customHtml`.
- Trusted embeds render provider-specific iframe URLs through safe renderer logic.

## Sanitizer Rules

HTML validation uses a parser/scanner utility, not regex-only sanitization.

Allowed profiles:

- `marketing-basic`
- `marketing-rich`
- `media-rich`
- `table-rich`
- `layout-rich`

Blocked everywhere:

- `script`, `style`, `iframe`, `object`, `embed`, `svg`, `canvas`, `form`, `input`, `button`, `textarea`, `select`, `option`, `link`, `meta`, `html`, `head`, `body`, `base`, `noscript`, `template`

Blocked attributes include:

- `on*`, `style`, `srcdoc`, `formaction`, `autofocus`, `contenteditable`

URL rules:

- Links allow relative URLs, hash links, `https:`, `mailto:`, and `tel:`.
- Images allow relative paths, `/media/`, `/images/`, and `https:`.
- `javascript:`, `data:`, `vbscript:`, `file:`, and `blob:` are rejected.
- `target="_blank"` links are normalized/warned to include `rel="noopener noreferrer"`.
- Images warn when alt text or an explicit decorative pattern is missing.

CSS rules:

- Blocks `@import`, unsafe `@font-face`, `url(javascript:)`, `url(data:)`, `expression()`, `behavior:`, `-moz-binding`, unscoped global selectors, `#__next`, and script-like strings.
- Warns on `!important`, `position: fixed`, high `z-index`, animations, transforms, filters, clip-path, excessive CSS length, unknown classes, and unsupported properties.

## Validation Behavior

Backend/API:

- Admin page create/update validates `customHtml`, `trustedEmbed`, and scoped CSS before storing.
- API-key page create/update validates the same rich-section fields before storing.
- Admin theme create/update validates design system tokens, domain CSS, and template CSS before storing.
- Blocking validation errors return `BadRequest`.

Admin editor:

- Page editor supports editing `customHtml` and `trustedEmbed` fields.
- Block editor supports adding and editing `customHtml` and `trustedEmbed`.
- Theme editor has a Design System JSON tab for tokens, domain CSS, template CSS, variants, and approved classes.
- Blocking errors prevent save through client preflight and API validation.
- Warnings are visible in admin rich-section validation panels.
- Sanitized HTML preview is shown for `customHtml`.

Known admin limitation:

- Theme token editing is JSON-based rather than a bespoke token form UI. Validation is active and blocking errors are enforced.

Public renderer:

- Applies tenant/domain token variables and validated design CSS.
- Supports approved section variants.
- Sanitizes `customHtml` and Blog body HTML before render.
- Renders trusted embeds only through safe provider logic.
- Does not allow content CSS to target head/meta/schema/nav/footer/forms/routing.

Import/export:

- Page import preflight validates rich blocks before write.
- Write imports still go through API page create/update validation.
- New structures are preserved as page block content or theme `designSystem` metadata.

Static export:

- Snapshot and static-publish validation now validate rich section content and theme design metadata.
- Static output/staging package validators scan page HTML for unsafe CMS-authored content and keep framework bundle noise separate by focusing route HTML and CMS-section markers.

## Fixtures / Tests Added

Fixture coverage includes:

- valid theme token rendering
- invalid theme token rejected
- valid scoped domain CSS
- invalid global CSS blocked
- valid section scoped CSS
- unscoped section CSS blocked
- valid `marketing-basic`, `marketing-rich`, `media-rich`, `table-rich`, and `layout-rich` customHtml
- script tag blocked
- onclick blocked
- javascript href blocked
- raw iframe blocked
- form/input blocked
- image missing alt warning
- external target blank rel correction/warning
- unknown class warning
- malformed HTML handling
- valid trustedEmbed provider
- invalid trustedEmbed provider blocked
- invalid trustedEmbed URL blocked

Fixture result:

- `node tools/design-system-validation/validate-fixtures.mjs`: passed, 23 cases.

## Checks Run

Completed:

- `git status --short --untracked-files=all`: clean at phase start.
- TypeScript models build with available workspace TypeScript binary: passed.
- Block renderer package build with available workspace TypeScript binary: passed.
- `npm run type-check` in `apps/admin`: passed.
- `npm run type-check` in `apps/ice-rink-web`: passed.
- `dotnet build apps/pumpkin-api/pumpkin-api.csproj --no-restore`: passed.
- `node tools/design-system-validation/validate-fixtures.mjs`: passed.
- `node --check` for changed `.mjs`/generated `.js` files: passed.
- `git diff --check`: passed. Git reported existing LF/CRLF normalization warnings only.
- Direct trailing whitespace scan over changed files: passed after mechanical cleanup in touched files.
- Protected config/workflow/generated-folder status check: passed, no protected config or generated static folders modified/staged.
- Targeted high-confidence secret scan over changed files: passed, no secrets found.
- Staged generated static folder check: passed, nothing generated is staged.

Note:

- `npm run build` inside `packages/pumpkin-ts-models` could not find package-local `tsc` because package-local `node_modules` is not installed in this workspace. The package was built with the installed TypeScript binary from `apps/admin/node_modules/.bin/tsc.cmd` and explicit Node type roots.

## Readiness Decision

Ready for Ice JSON templates to use:

- theme tokens: yes
- domain CSS: yes, if tenant-scoped
- template CSS / section variants: yes
- section scoped CSS: yes, if section-scoped
- `customHtml`: yes, with approved profiles and sanitizer validation
- `trustedEmbed`: yes, through approved providers

Remaining warnings are not production-blocking for Phase 8C.5. The main UX gap is the JSON-based theme design editor, which is acceptable for controlled template design work before CMS import.

## Next Recommended Phase

Phase 8C.6 or 8D should build the Ice 4-page JSON templates using this design system, then run import preflight before any CMS write.

Do not advance Roller unless explicitly requested.

## No-Go Confirmations

- No Ice CMS page templates were imported.
- No CMS content was rewritten.
- No CMS Theme data was patched.
- No CMS Page data was patched.
- No seed tool was run.
- No production static package was regenerated.
- No generated static output folders were directly edited.
- No Azure resources were created.
- No Azure deployment was run.
- No Cloudflare or DNS changes were made.
- No GitHub workflow was created.
- No protected config was read or modified.
- No secrets, API keys, JWTs, Azure tokens, deployment tokens, or Cloudflare tokens were printed or committed.
- RollerRinkRentals.com remains paused.
