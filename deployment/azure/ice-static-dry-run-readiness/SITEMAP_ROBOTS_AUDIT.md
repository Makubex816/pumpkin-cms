# Sitemap Robots Audit

## Fresh Dry Run

Fresh sitemap and robots output was produced by the successful local static export.

Route-shape proof passed, but production/indexing readiness remains blocked by CMS robots metadata.

## Current CMS Metadata

Approved-page robots metadata in the fresh snapshot:

| Slug | Robots |
| --- | --- |
| `home` | `noindex, nofollow` |
| `contact` | `index,follow` |
| `service-areas` | `noindex, nofollow` |

Noindex is coming from CMS page metadata. No CMS metadata write was performed.

Recommended CMS metadata change: when production approval is granted, set `home` and `service-areas` robots metadata to `index,follow` or otherwise clear their noindex controls.

## Strict Validator Result

Strict production/staging validators still reject the generated output for noindex, along with media and form endpoint blockers.

## Readiness

Sitemap/robots route output proof: yes.

Production/indexing readiness: no.
