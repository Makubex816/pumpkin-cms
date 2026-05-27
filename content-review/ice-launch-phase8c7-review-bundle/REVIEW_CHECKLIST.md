# Review Checklist

Use this checklist for IceSkatingRinkRentals.com human review before any CMS import.

RollerRinkRentals.com remains paused.

## Copy Review

- Confirm each page is customer-facing and clear.
- Remove internal phase language from any copy that would become public.
- Confirm the offer is accurate and does not overpromise coverage, pricing, timing, partners, installation history, or availability.
- Confirm the homepage explains portable ice rink rentals without requiring the customer to know technical rink details.
- Confirm the contact page asks for useful event details without feeling burdensome.
- Confirm the service areas page avoids unsupported city, state, or regional service claims.

## Design Review

- Confirm the page flow feels polished enough for launch review.
- Confirm the hierarchy works on desktop and mobile.
- Confirm section density is appropriate for a service business site.
- Confirm hero, trust, process, FAQ, and final CTA sections are visually distinct.
- Confirm custom HTML sections enhance clarity rather than adding clutter.

## SEO Review

- Confirm SEO titles are concise and accurate.
- Confirm meta descriptions match visible page intent.
- Confirm focus keywords and secondary keywords are appropriate.
- Confirm `/service-areas` is the canonical service-area route.
- Confirm `/areas-served` remains only a future alias or redirect candidate.
- Confirm no city/location page is implied as active before a target is approved.
- Confirm `robots` should remain `noindex, nofollow` until production approval.

## Schema Review

- Confirm schema recommendations are accurate and not overclaiming.
- Keep Service schema disabled until service-area language is approved.
- Enable FAQ schema only for visible FAQ content.
- Do not enable areaServed output for placeholder regions or cities.
- Confirm ContactPage schema only after public contact details and form behavior are approved.

## CTA Review

- Confirm the primary CTA points to `/contact`.
- Confirm the service-area CTA points to `/service-areas`.
- Confirm CTA copy is specific, helpful, and not pushy.
- Confirm homepage, contact, and service-area routes link to each other intentionally.
- Confirm the future city page link remains a placeholder note only.

## Form Review

- Confirm the Contact block remains structured form metadata, not raw HTML form markup.
- Confirm required fields are appropriate: name, email, event date, event location, and message.
- Confirm optional fields are useful: phone, venue type, expected attendance, and surface/access details.
- Resolve `{{STATIC_CONTACT_ENDPOINT_REF}}`.
- Resolve `{{LEAD_RECIPIENT_REF}}`.
- Confirm no private email address, token, API key, or secret is placed in public JSON.
- Confirm no real email sending is enabled during review.

## Mobile And Desktop Review

- Confirm headings and CTA labels fit on small screens.
- Confirm custom HTML grid sections can stack cleanly on mobile after renderer/theme review.
- Confirm table sections remain readable or receive a mobile treatment before production.
- Confirm tap targets are clear.
- Confirm no content overlaps navigation, footer, form fields, or schema-rendered areas.

## Service Area Wording Review

- Confirm `{{PRIMARY_SERVICE_AREA}}` and `{{PRIMARY_REGION}}` are resolved or explicitly blocked.
- Confirm no unapproved state, city, metro, or county is claimed as served.
- Confirm availability is framed as review-based until coverage is approved.
- Confirm the targeted city/location page remains excluded.
- Confirm any future alias from `/areas-served` to `/service-areas` is a routing decision, not a duplicate content page.

## Brand Voice Review

- Confirm the tone is polished, direct, and practical.
- Confirm the copy feels helpful to event planners, venues, municipalities, schools, and corporate event teams.
- Confirm the brand voice avoids hype, filler, unsupported proof, and vague promises.
- Confirm customer trust comes from clarity, process, and realistic expectations.

## Rich HTML / CSS / Design-System Review

- Confirm `customHtml` sections use allowed profiles.
- Confirm section variants are approved.
- Confirm `sectionScopedCss` stays scoped to the matching `data-section-id`.
- Confirm no inline style attributes are introduced.
- Confirm no raw iframe, script, form, input, button, textarea, select, or unsafe URL is introduced.
- Confirm approved class names use shared prefixes or the `ice-` prefix.
- Re-run Phase 8C.5 validators after any edit.
