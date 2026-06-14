# Next Phase Prompt

Use this prompt only after V2.9.4 is reviewed and approved.

```text
Proceed with V2.9.5 Audit Job Ledger Read-Only Admin Viewer Navigation And QA Hardening.

Approved scope:
- Keep the work local/read-only.
- Review the V2.9.4 Admin viewer route and result package.
- Reconcile the existing dashboard layout worktree state, then add a scoped top-navigation entry for /dashboard/audit-jobs only if safe.
- Add stronger Admin viewer QA, including browser/screenshot checks only if existing repo tooling is installed and can run without live provider calls.
- Consider a shared viewer-model package plan if it reduces transform duplication without adding live APIs.
- Produce a V2.9.5 result package, root report, validation summary, and control-doc updates.

Not approved:
- Live API endpoint implementation.
- Pumpkin API endpoint implementation.
- Electron implementation.
- Deployment or redeployment.
- DNS/custom-domain mutation.
- Google/Search Console/indexing action.
- Sitemap submission.
- Crawling or outbound live checks.
- Contact form submission or contact endpoint POST.
- CMS/provider/Azure writes.
- Protected config reads.
- Token/key/connection string/SAS use.
```
