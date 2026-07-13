# Next Phase Prompt

## V2.8.62DRRR - Vegas Self-Route Redirect Contract Resolution And Held Metadata Completion

Owner approval is required before any further live mutation.

Current immutable carryforward:

- Tenant and TenantAdmin preserved.
- Theme 1, clubs 10, guides 19, MediaAssets 302, aliases 473, FormDefinitions 32, mappings 65.
- Pages 43 / 43 with unique IDs/slugs and intact launch holds.
- Contact exists exactly once after the single approved retry.
- Redirects 1 / 3.
- Domain bindings 0, import runs 0, publish runs 0.
- No deploy, DNS, TLS, publish, indexing, form POST, FormEntry, Airstrip, Ice, or Party Pros action.

Blocker: the two missing redirects have `from` equal to the owning page's current slug. `PageRevisionHelper.MergeRedirects` drops that shape during updates. The current API and the requested 43-page/3-redirect package representation conflict.

The owner must explicitly select and approve one contract resolution:

1. Approve an API design/source change, focused tests, a separately counted API deployment, and post-deploy update/readback so the 43-page/3-redirect representation is intentionally supported.
2. Approve a package-fidelity deviation and targeted destructive reconciliation that treats the two alias routes as redirects rather than live page records, with revised final page counts and redirect ownership.
3. Approve a narrowly scoped direct data repair only after backup/readback design; this is not recommended because normal page updates may remove the records again.
4. Accept 43 pages and 1 redirect as an explicit owner deviation and keep the other two routes non-redirecting.

Do not exploit the create-route validation gap or delete/recreate pages without explicit owner selection. After resolution, read back all 3 redirects, create only source-supported pending domain metadata and held audit records, reconcile counts, and run the non-Airstrip runtime sweep. Keep launch, indexing, forms, DNS, TLS, and publication held.

Only after DRRR completes may a separately approved `V2.8.62E - Post-Creation Backup/Admin/Preview Readiness` begin. Retain `V2.8.63A` as the later multi-tenant identity, email-change, and membership-transfer architecture phase.
