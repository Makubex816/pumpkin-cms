# Remaining Blockers

## Local Route-Shape Proof

Cleared:

- Ice-only static command exits `0`
- approved CMS snapshot slugs are exactly `home`, `contact`, `service-areas`
- fresh route output is exactly `/`, `/contact`, `/service-areas`
- preview and obsolete route folders are absent from deployable output
- theme 401 is fixed

## Before Media Production Readiness

- Publish approved media binaries to the planned production media origin in a separately authorized task.
- Update MediaAsset production public URLs in a separately authorized CMS/media task.
- Confirm no local `/media/...` URLs remain in snapshot or static output.
- Confirm no unapproved rendered image URLs remain, especially the current Open Graph/Twitter image URL rendered under `https://iceskatingrinkrentals.com/media/...` instead of `https://media.iceskatingrinkrentals.com/...`.

## Before Contact Form Production Readiness

- Deploy or configure a static form endpoint in a separate authorized task.
- Verify endpoint/backend behavior.
- Confirm form submission readiness is not inferred from mailbox readiness.

## Before Production Indexing

- Remove `noindex` from approved production-intended CMS pages in a separately authorized CMS metadata task:
  - `home`
  - `service-areas`
- Confirm `apps/ice-rink-web/out/index.html` and `apps/ice-rink-web/out/service-areas/index.html` render indexable robots metadata after the CMS change.
- Review and clear service-area claim language in a separately authorized CMS content task.
- Regenerate and validate sitemap/robots after metadata changes.

## Before Permanent Theme Navigation Readiness

- Update or approve active CMS/theme navigation so production primary navigation includes only:
  - `/`
  - `/contact`
  - `/service-areas`
- Remove obsolete theme menu entries for:
  - `/ice-rink-rentals`
  - `/events-holiday-activations`
  - `/ice-rink-rentals#faq`

## Before Azure Staging

- Clear media, form, noindex, and permanent theme navigation gates.
- Create Azure staging resources only after explicit authorization.
