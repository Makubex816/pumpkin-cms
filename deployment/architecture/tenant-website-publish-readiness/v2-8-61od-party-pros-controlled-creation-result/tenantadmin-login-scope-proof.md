# TenantAdmin Login Scope Proof

Status: not run.

The TenantAdmin was created, but login and scope proof were not run because V2.8.61OD hit the compiled record import hard stop after tenant creation. Running the TenantAdmin login would mutate `LastLogin`, so it is left for a recovery approval.

