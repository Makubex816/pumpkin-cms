# Rollback, retention, and no regression

The A01 static artifact is preserved lineage evidence only: it was never deployed, has no release ID, and lacks the required noindex/client contract. Release pub20-a02-release-v2 is the first safe deployed static release. API predecessor deployment c9451f4b-0b2e-44bc-9d08-ac9b767a6c05 and slot deployment f6bdf0d7-ca60-4e7f-818c-f4c74a710a86 are lineage, not a claim of one-click binary rollback.

Preferred retention is the isolated Free/noindex fixture and its one synthetic FormEntry. The first kill switch is SuperAdmin POST /api/admin/public-publications/pub20-a02-pilot/revoke. Then verify public preflight/submit unavailable, disable the synthetic identity/tenant/form while retaining audit data, reset and remove or quarantine the SWA token, stop sharing or delete the isolated SWA/resource group if separately executed, and redeploy retained-source API only if needed. Never delete the shared container or change shared throughput.

At the blocked A02 audit this remained a rollback plan, not a completed rollback proof: the publication and origin were active, the FormDefinition remained in public-ticket mode, ticket issuance was available, and the public-live A02 artifact was deployed. No separate safe no-post artifact was active or proven.

Final aggregate readback: tenants 5 total and 4 non-synthetic, non-synthetic tenant identity digest f29cab25d256e6e4e9a059007946929a88494929b1c2117aa0cddfc54e5fb5d0; FormEntries 13 total and 12 non-synthetic, including exactly 1 synthetic; non-synthetic FormEntry identity digest 278fbd36ac0a470e9c1e22ce8c4ed2286aba1c86816d9f7d98b42baf47520500; PublicPublications 1; FormDefinitions 36 total, 35 non-synthetic, and 1 synthetic; Cosmos containers 32; SWAs 3; pilot custom domains 0; pilot linked backends 0.

API health/readiness, Admin shell, starter, Ice, Party Pros, Vegas, existing entries, domains, and S2/two-worker capacity were reproven. The Admin forms route returned a 200 application shell; this is not represented as a browser-rendered inbox proof. TenantAdmin and SuperAdmin API readbacks provide the scoped data-plane proof. Synthetic credentials were quarantined. GhostDevStack, customer tenants, Airstrip, indexing, external email, payments, paid plans, and capacity were unchanged.

No new paid plan or dedicated Cosmos throughput was created. The retained SWA is Free, the database remains shared manual 400 RU, and S2/two-worker capacity is unchanged; this is a resource-shape observation, not an exact billing claim.
