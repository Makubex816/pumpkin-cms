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

- Approved media binaries have been uploaded and Cloudflare Worker public media delivery validates.
- The 9 approved Ice MediaAsset records were updated to production public URLs in a separately approved 2026-06-05 task.
- A separately approved 2026-06-05 page body/media repair cleared active root `ContentData` and root `media` local URLs on `home`, `contact`, and `service-areas`.
- A separately approved 2026-06-05 static revision-payload cleanup removed `revision.latestSnapshot` from public static snapshot artifacts.
- Full media production URL readiness is now `yes`.
- Keep Open Graph/Twitter social image fields empty or replace them only with approved production media URLs after media readiness work is authorized.
- Do not mutate rollback snapshots in CMS; the public static artifact cleanup did not require CMS revision writes.

## Before Contact Form Production Readiness

Cleared by later separately approved production form enablement and the official fresh CMS export retry:

- approved static form endpoint URL configured for validation/build context
- endpoint/backend verification flag set for the approved context
- strict form endpoint validator errors: 0
- no valid email payload was sent in the fresh export verification pass

## Next Local Build Gate

Classification: fresh CMS-backed static output quality gates passed.

No unexpected tooling repair is required from the current local state. Azure staging remains a separate approval.

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

- Confirm permanent theme navigation approval/update if required.
- Review remaining content/fulfillment launch warnings.
- Create or deploy Azure staging resources only after explicit authorization.
