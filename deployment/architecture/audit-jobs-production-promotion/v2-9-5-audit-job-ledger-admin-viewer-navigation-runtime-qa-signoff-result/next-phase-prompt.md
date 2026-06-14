# Next Phase Prompt

Use this prompt only after V2.9.5 is reviewed and approved.

```text
Proceed with V2.9.6 Audit Job Ledger Shared Viewer Model And Read-Only API Contract Planning only.

Approved scope:
- Keep the work local/read-only.
- Review V2.9.2 through V2.9.5 result packages and the Admin viewer implementation.
- Plan how to reduce duplicate viewer-model transformation logic between the audit-job-ledger package and Admin fixture provider.
- Draft a read-only API contract for a future audit/job ledger viewer without implementing the endpoint.
- Define endpoint inputs, response shape, safety flags, evidence binding, route auth expectations, and no-write validation requirements.
- Document how Electron and live provider integration remain future separately approved boundaries.
- Produce a V2.9.6 result package, root report, validation summary, and control-doc updates.

Not approved:
- live API endpoint implementation;
- Pumpkin API endpoint implementation;
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
