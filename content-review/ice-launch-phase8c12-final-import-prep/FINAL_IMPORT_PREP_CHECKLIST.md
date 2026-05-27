# Final Import Prep Checklist

## Before CMS Import

- Confirm primary public phone or approve omitting phone display.
- Confirm primary public email or approve hiding email behind the form.
- Confirm legal/business display name.
- Confirm primary service-area wording.
- Confirm primary region wording.
- Approve homepage copy and CTA language.
- Approve contact page copy, quote form labels, and response expectations.
- Approve service areas copy without unsupported local claims.
- Upload or select required active MediaAsset records for all blocker slots.
- Confirm image alt text, license/source, usage state, and dimensions.
- Run the .NET Page contract gate.
- Run TypeScript/design-system/default-form/media validators.
- Run unsafe HTML/CSS/form/media and secret scans.
- Run admin import/export preflight in dry-run mode.

## Must Block CMS Import

- Missing required MediaAsset IDs for required page media slots.
- Fake public phone, fake public email, fake media URL, or unapproved external image.
- Unapproved business name, service-area wording, or region claim.
- Missing human approval.
- Missing visible `/contact` formBlock.
- Missing `ICE_RINK_RENTALS_LEAD_RECIPIENT` or `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` reference.
- Any `.NET Page` contract validation error.
- Any raw script, iframe, object, embed, form, input, button, textarea, select, inline event handler, unsafe URL, base64 image, or unscoped CSS.
- Missing admin import/export dry-run preflight.

## Can Be Deferred Until Staging

- Final browser visual QA.
- Staging-safe form smoke test.
- Azure default-host browser review.
- Sitemap, robots, canonical, and schema verification against fresh static output.

## Must Block Production

- CMS import not completed.
- Fresh static regeneration not completed after CMS import.
- Static or staging validators failing.
- Public phone/email decision unresolved.
- Required media unresolved or unapproved.
- Unsupported service-area/city claim.
- Production cutover approval missing.
