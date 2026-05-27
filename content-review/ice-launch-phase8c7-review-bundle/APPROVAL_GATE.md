# Approval Gate

This gate must be completed before any CMS import or page update.

IceSkatingRinkRentals.com is the only site in scope.

RollerRinkRentals.com remains paused.

## Required Approvals Before CMS Import

Content owner:

- Approves page copy.
- Confirms no unsupported claims are present.
- Confirms no city/location page should be created yet.

Design or UX reviewer:

- Approves page structure, section order, and design-system usage.
- Confirms custom HTML sections are useful and not cluttered.
- Confirms mobile and desktop expectations are acceptable for import preflight.

SEO/schema reviewer:

- Approves titles, descriptions, focus keywords, internal links, canonical routes, and schema recommendations.
- Confirms `/service-areas` is canonical.
- Confirms `/areas-served` remains only a future alias or redirect candidate.

Operations or form owner:

- Approves form fields.
- Resolves non-secret endpoint and lead-recipient references.
- Confirms no real email send is triggered during review.

Technical CMS reviewer:

- Re-runs JSON parse validation.
- Re-runs Phase 8C.5 rich-section and theme design-system validation.
- Runs admin import/export preflight in dry-run mode before any write.
- Confirms no protected config or secret values are present.

## Must Block CMS Import

- Any unresolved required placeholder unless explicitly approved as an import blocker.
- Missing approval from content, design, SEO/schema, operations/form, or technical CMS review.
- Any raw script, iframe, form, input, button, textarea, select, inline style, unsafe URL, or unscoped CSS in `customHtml`.
- Any service-area, city, partner, testimonial, insurance, pricing, availability, or delivery claim that is not approved.
- Any private email, API key, JWT, Azure token, deployment token, Cloudflare token, SMTP credential, or other secret.
- Any planned city/location page without confirmed city, state, route, service-area wording, and indexability decision.
- Any attempt to import without dry-run preflight.

## Can Be Deferred Until Staging

- Final visual QA against rendered static output.
- Default-host staging browser review.
- Final Core Web Vitals and accessibility pass.
- Static package route, sitemap, robots, and canonical verification.
- Non-production form endpoint smoke testing when explicitly configured for staging.
- Final schema rendering verification against static output.

Deferred staging items must be documented before production.

## Must Block Production

- CMS pages not approved through workflow.
- Static package not regenerated after CMS changes.
- Static validators failing.
- Staging package validator failing.
- Staging review not completed.
- Incorrect canonical URLs, sitemap entries, robots policy, or schema output.
- Any unresolved public placeholder.
- Any unsupported service-area or city claim.
- Any broken contact form or misleading form success state.
- Any secret or protected config value in public content or build output.
- Any unapproved Azure, Cloudflare, DNS, custom-domain, or production cutover action.

## Approval Record

Record approvals in a future phase report or an approved CMS import preflight record.

Do not treat this Markdown file as approval by itself.
