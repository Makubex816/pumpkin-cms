# Runtime HTTP Warning Resolution Decision

Decision: resolved for local Admin route serving.

V2.9.5 warning:

`local_next_dev_server_listened_but_timed_out`

V2.9.7 finding:

- stale repo-local Admin Next listeners on ports `3000` and `3001` timed out before remediation;
- after stopping those listeners and clearing generated `apps/admin/.next`, a fresh local dev server reached ready state and served `/dashboard/audit-jobs` with HTTP `200`.

The warning remains historically visible in the V2.9.6 envelope fixture and contract metadata, but it is no longer an active blocker for local Admin route verification.

