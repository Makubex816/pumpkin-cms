# Next Phase Prompt

Use this prompt only after V2.9.6 is reviewed and approved.

```text
Proceed with V2.9.7 Admin Shared Contract Adapter and Local Runtime HTTP Remediation only.

Approved scope:
- Keep the work local/read-only.
- Review V2.9.6 shared viewer model and read-only API envelope contracts.
- Update the Admin audit-jobs viewer to consume the shared contract shape or generated read-only API fixture locally, without adding a live API endpoint.
- Reduce duplicate Admin/provider viewer transformation logic where safe.
- Preserve route `/dashboard/audit-jobs` and dashboard navigation.
- Diagnose and remediate the local Next dev-server HTTP timeout enough to support local route GET/browser QA.
- Run Admin type-check, V2.9.5 QA, any new V2.9.7 QA, audit-ledger contract validation, and no-write scans.
- Produce V2.9.7 result package, root report, validation summary, and control-doc updates.

Not approved:
- live API endpoint implementation;
- Pumpkin API runtime endpoint implementation;
- Electron runtime implementation;
- deployment or redeployment;
- DNS/custom-domain mutation;
- Google/Search Console/indexing action;
- sitemap submission;
- crawling or outbound live checks;
- contact form submission or contact endpoint POST;
- CMS/provider/Azure writes;
- protected config reads;
- token/key/connection string/SAS use.
```
