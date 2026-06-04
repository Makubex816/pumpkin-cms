# Rollback Plan

Rollback principles:

- Keep previous static release package.
- Keep CMS revision/rollback metadata.
- Keep previous MediaAsset URLs available during rollback.
- Prefer checksum-versioned media URLs so old media remains addressable.
- Use Cloudflare purge only if needed.
- Maintain DNS rollback plan if custom domain cutover fails.

Static rollback:

1. Identify last known good static release.
2. Redeploy previous static release to Azure staging or production as appropriate.
3. Validate `/`, `/contact`, `/service-areas`.
4. Confirm contact form behavior.
5. Confirm media URL behavior.

CMS rollback:

1. Use CMS revision/rollback metadata.
2. Re-verify live CMS route state.
3. Regenerate static only after approval.

Media rollback:

1. Keep prior Blob objects available through rollback window.
2. Keep prior MediaAsset public URLs valid.
3. Avoid emergency purge unless stale CDN content is harmful.

DNS rollback:

1. Preserve previous DNS values before cutover.
2. Keep TTL/cutover plan documented.
3. Revert DNS only with explicit approval.
