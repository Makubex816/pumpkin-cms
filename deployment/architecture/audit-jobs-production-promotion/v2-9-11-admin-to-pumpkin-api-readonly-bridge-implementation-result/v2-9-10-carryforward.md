# V2.9.10 Carryforward

V2.9.10 planned this bridge and is the immediate carryforward anchor.

Accepted carryforward:

- V2.9.9 API route family: eight GET-only routes under `/api/admin/audit-jobs`;
- Admin fixture provider mode: `admin-local-fixture-readonly`;
- future Admin provider mode: `admin-api-readonly`;
- API provider mode: `api-local-fixture-readonly`;
- fixture default fallback requirement;
- tenant/site query requirement on every API request;
- local no-write safety boundary;
- Google/Search Console/indexing deferred hard stop.

V2.9.10 runtime blocker carried forward:

- localhost API GET proof was blocked because the runtime resolved database service/Cosmos setup before the Audit Jobs handler.

V2.9.11 disposition:

- fixed by resolving `IDatabaseService` lazily only inside `TenantCors` policy handling, leaving the `AllowAll` policy path used by Admin/Audit Jobs runtime checks free of database construction.
