# Import Candidate Checklist

## Before CMS Import

- Content owner approves copy for Homepage, Contact, and Service Areas.
- Design/UX reviewer approves section order, rich sections, and mobile/desktop expectations.
- SEO/schema reviewer approves titles, descriptions, canonical routes, internal links, and disabled schema strategy.
- Operations/form owner approves structured form fields and non-secret routing references.
- Operations/form owner approves the visible `formBlock` using `default-quote-request`.
- Technical CMS reviewer runs JSON parse, .NET Page contract validation, TypeScript/design-system validation, media validation, unsafe scan, and admin import/export preflight in dry-run mode.
- Approved MediaAsset records are uploaded/selected for every blocker media requirement.
- Public phone/email are confirmed or intentionally omitted with approval.
- Primary service-area wording is confirmed or removed from public/schema output.
- No target city page or target city claim is added until a specific city is approved.

## Must Block CMS Import

- Any unresolved required MediaAsset requirement.
- Any public placeholder or fake media URL.
- Any unapproved phone, email, service-area, or city claim.
- Missing human approval.
- Missing visible contact-page `formBlock`, missing default form definitions, or broken `default-quote-request` validation.
- Any raw script, iframe, form, input, button, textarea, select, inline style, unsafe URL, base64 image, or unscoped CSS.
- Any private email, API key, JWT, Azure token, deployment token, Cloudflare token, SMTP credential, storage key, or connection string.
- Any page JSON that cannot deserialize and round-trip through the .NET `Page` and block classes.
- No successful dry-run import/export preflight.

## Can Be Deferred Until Staging

- Final rendered mobile/desktop visual QA.
- Static package route, sitemap, robots, canonical, and schema verification.
- Staging-safe form smoke test.
- Static endpoint and Lead Inbox smoke test with non-production-safe test payloads only.
- Azure default-host browser review.

## Must Block Production

- Missing CMS workflow approval.
- Missing fresh static regeneration after CMS import.
- Failed static or staging package validators.
- Incorrect robots, sitemap, canonical, schema, or form behavior.
- Any unresolved public placeholder or unsupported service-area/city claim.
