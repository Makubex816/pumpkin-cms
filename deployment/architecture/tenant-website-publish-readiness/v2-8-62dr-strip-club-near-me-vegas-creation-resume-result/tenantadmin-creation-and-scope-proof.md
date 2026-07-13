# TenantAdmin Creation And Scope Proof

Exactly one TenantAdmin was created for `strip-club-near-me-vegas` using `klavier91@proton.me`. Creation returned HTTP 201 without password/hash material. Initial login and token verification returned HTTP 200 with role `TenantAdmin` and the Vegas tenant ID.

The own-tenant list returned exactly one tenant. Ice and Party Pros page/form/media/theme reads, global user management, direct SuperAdmin tenant reads, cross-tenant reads, and platform domain management returned 401 or 403. Airstrip runtime was not probed. A later hardcopy-closeout login also succeeded.
