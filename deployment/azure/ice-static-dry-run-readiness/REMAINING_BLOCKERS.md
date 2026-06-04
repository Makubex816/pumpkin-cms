# Remaining Blockers

## Local Route-Shape Proof

Cleared:

- Ice-only static command exits `0`
- approved CMS snapshot slugs are exactly `home`, `contact`, `service-areas`
- fresh route output is exactly `/`, `/contact`, `/service-areas`
- preview and obsolete route folders are absent from deployable output
- theme 401 is fixed
- `home` and `service-areas` active robots metadata is `index,follow`
- unapproved rendered Open Graph/Twitter image URL is cleared

## Before Media Production Readiness

- Publish approved media binaries to the planned production media origin in a separately authorized task.
- Update MediaAsset production public URLs in a separately authorized CMS/media task.
- Confirm no local `/media/...` URLs remain in snapshot or static output.
- Keep Open Graph/Twitter social image fields empty or replace them only with approved production media URLs after media readiness work is authorized.

## Before Contact Form Production Readiness

- Deploy or configure a static form endpoint in a separate authorized task.
- Verify endpoint/backend behavior.
- Confirm form submission readiness is not inferred from mailbox readiness.

## Before Production Content Approval

- Review and clear service-area claim language in a separately authorized CMS content task.
- Keep sitemap/robots validation in the final pre-deployment check set.

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

- Clear media, form, and permanent theme navigation gates.
- Create Azure staging resources only after explicit authorization.
