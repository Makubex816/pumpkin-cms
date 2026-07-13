# Next Phase Prompt

## V2.8.62DRT - Vegas Meaningful Redirect Representation API Enhancement Proposal And Import Closeout

Separate owner approval is required. DRS proved that the two missing declarations are meaningful moved-route redirects, not canonical no-ops.

Current carryforward:

- Tenant 1, TenantAdmin 1, theme 1.
- Pages 43 with 43 unique IDs/slugs; contact exactly once.
- Redirect declarations 3; persisted redirects 1; meaningful blocked redirects 2; cycles 0.
- Clubs 10, guides 19, MediaAssets 302, aliases 473, FormDefinitions 32, mappings 65.
- Domain bindings 0, import runs 0, publish runs 0.
- All content unpublished/noindex/no-post.

Proposed DRT scope:

1. Design an explicit moved-route redirect or canonical-alias model that does not overload a page's current route and cannot create self-loops.
2. Define create/update/readback collision and cycle semantics.
3. Add API source, model, persistence, migration, and focused tests only with explicit approval.
4. Obtain a separately counted API deployment approval before any live activation.
5. Persist and read back only the two missing meaningful redirects.
6. Then complete pending domain metadata, import audit, held publish audit, final tenant isolation, and non-Airstrip runtime proof.

Do not use direct data repair, delete/recreate pages, exploit the create-route gap, deploy, or mutate live data without that approval. After DRT fully succeeds, fold `V2.8.62E - Post-Creation Backup/Admin/Preview Readiness` into the next separately approved phase. Retain `V2.8.63A` as the future multi-tenant identity, email-change, and TenantAdmin-transfer architecture phase.
