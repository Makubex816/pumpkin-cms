# V2.8.62DRU Next-Phase Prompt

Approve `V2.8.62DRU - Targeted Vegas Redirect Reconciliation and Import Closeout` only after V2.8.62DRT is committed.

Carryforward:

- Generic TenantRedirect source, API, Cosmos/Mongo support, backup contract, import planner, and starter middleware are locally complete.
- The one DRT API deploy succeeded and routes are live/auth-gated.
- Live internal validation is blocked because the deployed Linux build misclassified leading-slash paths.
- The cross-platform fix is present in local source, focused tests pass, and Release build passes.
- Vegas remains unchanged: 43 pages, 1 page-owned redirect, 0 generic redirects, all content held.

Required DRU gate order:

1. Verify the DRT commit and zero staged files.
2. Rebuild a POSIX-safe API ZIP from the committed corrected source outside the repo; exclude protected config.
3. Obtain explicit approval for exactly one Pumpkin API deployment of that corrected build.
4. Deploy once, then prove no-auth routes remain auth-gated.
5. Use SuperAdmin authentication in memory and require both Vegas validate calls to return HTTP `200`, `valid: true`, `persistable: true`, resolved targets, explicit page shadows, and zero cycles.
6. If either validation fails, stop before every tenant-data write.
7. Recheck the generic Vegas redirect list is empty and the page-owned redirect count is still `1`.
8. Create exactly the two planned `301` TenantRedirect records through the Admin API using deterministic idempotency metadata.
9. Read back exactly two generic records, preserve the one page-owned redirect, and rerun full Vegas/Ice/Party Pros no-mutation accounting.
10. Do not deploy the starter, publish Vegas, alter DNS/TLS, submit a form, create a FormEntry, or request Airstrip.

If the corrected API deploy is not separately approved, DRU must remain blocked before redirect creation.

Retain `V2.8.63A` as the future multi-tenant identity, email-change, and TenantAdmin-transfer phase. It is not part of DRU.
