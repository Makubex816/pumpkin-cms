# Read-Only Preflight Boundaries

A future CMS read-only preflight requires separate explicit approval. This Phase 2C-5 package does not run it.

## May Be Allowed After Separate Approval

- Verify required environment-variable presence without printing values.
- Re-run the local/offline validator against the approved Roller package.
- Confirm the local package path and validation evidence path.
- Query CMS current state in read-only mode.
- Check whether a Roller tenant, site, route, form, SEO record, or redirect already exists.
- Check whether forbidden routes are absent or blocked in CMS state.
- Produce a redacted preflight evidence report.

## Must Remain Excluded

- CMS create, update, delete, publish, unpublish, or migration operations.
- MediaAsset writes or binary uploads.
- Azure, Cloudflare, DNS, deployment, Function App setting, email, Microsoft 365, Search Console, sitemap, URL Inspection, indexing, or external HTTP checks.
- Protected config reads.
- Secret printing.
- Live-page publication.

## Read-Only Evidence Requirements

The later preflight evidence must record:

- approval text used for the read-only preflight
- operator name or role
- timestamp
- package path
- validator command summary
- env presence status only
- CMS read-only query names and redacted results
- conflict findings
- go/no-go decision
- hard-stop confirmation

If any read-only check requires a mutation to continue, stop and request a new approval.
