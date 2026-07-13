# Next Phase Prompt

## V2.8.62FRR - Shared Starter Party Pros Fixture Restoration, Theme Alias Repair, and Cross-Tenant No-Regression Redeploy

V2.8.62FR completed the Vegas media unblock and deployed a technically healthy starter package, but the final live gate closed as `partial_preview_deployed_live_fidelity_failed_no_second_deploy`. The clean ZIP omitted the external Party Pros runtime fixture. Party Pros public proof is now 0/16, preview proof is 0/8, and `/themes/party-pros-orange-slate-v1.css` returns 404. The FR deployment allowance is exhausted.

This recovery phase requires separate owner approval before any live action.

### Proposed Scope

1. Read back the current partial state without mutation.
2. Revalidate the latest external Party Pros fixture at SHA-256 `2e19d8c084a9cbcb6d5897e1ed7da0380274e96ee7e2662e4210a0c28459dd26`.
3. Build a deployment assembly that explicitly requires both Party Pros and Vegas fixture trees.
4. Add or source-correct the missing `party-pros-orange-slate-v1.css` theme-ID asset without changing Party Pros CMS records.
5. Prove both tenants locally and fail packaging if either fixture or required theme asset is absent.
6. Build and audit a new external POSIX ZIP with no secrets or protected config.
7. If separately approved, make exactly one recovery deployment to the same starter App Service.
8. Require Party Pros public 16/16, Party Pros preview 8/8, theme asset 1/1, Vegas 43/43, and full runtime 85/85.
9. Keep forms no-post during recovery proof and make zero Airstrip requests.

### Still Held

No CMS, tenant, identity, credential, runtime-key, appsetting, storage, DNS, TLS, publication, indexing, contact POST, form submission, FormEntry, Airstrip, or Ice mutation is implied. Do not start V2.8.62G until recovery passes and the FR acceptance gate is reclosed successfully.

Retain V2.8.63A as the future multi-tenant identity, verified login-email change, TenantAdmin transfer, and tenant-contact-email architecture phase.
