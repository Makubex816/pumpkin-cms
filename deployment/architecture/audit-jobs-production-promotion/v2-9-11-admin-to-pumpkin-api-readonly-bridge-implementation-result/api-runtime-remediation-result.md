# API Runtime Remediation Result

V2.9.10 blocker:

- local API GET checks reached global CORS handling before the Audit Jobs handler;
- the tenant CORS provider eagerly resolved `IDatabaseService`;
- `DatabaseService` constructed the configured database provider and failed without safe local DB connection configuration.

V2.9.11 remediation:

- `TenantCorsPolicyProvider` now stores `IServiceProvider`;
- `IDatabaseService` is resolved only inside `BuildTenantPolicyAsync`;
- that method runs only for the `TenantCors` policy;
- the global `AllowAll` policy used by Admin/auth/local Audit Jobs checks no longer constructs the database service.

This is scoped runtime remediation. It does not add an API route and does not change the Audit Jobs route contract.
