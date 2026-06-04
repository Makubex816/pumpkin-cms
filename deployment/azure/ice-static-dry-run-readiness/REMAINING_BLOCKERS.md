# Remaining Blockers

## Before Static Dry Run Completion

- Clear production media URL blockers:
  - approved pages still use local `/media/ice-rink-rentals/...` URLs
- Clear CMS robots metadata blockers:
  - `home` is `noindex, nofollow`
  - `service-areas` is `noindex, nofollow`
- Clear static contact form endpoint blockers:
  - endpoint is missing
  - backend verification flag is missing
- Clear theme navigation blockers:
  - obsolete URLs remain in theme menu
  - root `/` is missing from expected primary navigation

## Before Static Route Output Ready

- Produce a fresh static output after snapshot validation passes.
- Confirm route output is exactly:
  - `/`
  - `/contact`
  - `/service-areas`
- Confirm obsolete route folders are absent.
- Confirm preview routes are absent.
- Reject stale output if it still contains wrong-domain, missing-route, obsolete-route, or form-readiness failures.

## Before Media Production Readiness

- Publish approved media binaries to the planned Blob/Cloudflare path in a separately authorized task.
- Update MediaAsset production public URLs in a separately authorized CMS/media task.
- Confirm no local `/media/...` URLs remain in snapshot or static output.

## Before Contact Form Production Readiness

- Deploy or configure a static form endpoint in a separate authorized task.
- Verify endpoint/backend behavior.
- Confirm form submission readiness is not inferred from mailbox readiness.

## Before Production Indexing

- Remove `noindex` from approved production-intended CMS pages in a separately authorized CMS metadata task.
- Review and clear broad East Coast service-area claim language in a separately authorized CMS content task.
- Regenerate and validate sitemap/robots after metadata changes.

## Before Azure Staging

- Clear route, media, form, and indexing gates.
- Create Azure staging resources only after explicit authorization.
