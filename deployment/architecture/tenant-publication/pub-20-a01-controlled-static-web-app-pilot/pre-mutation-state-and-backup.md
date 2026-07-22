# Pre-mutation state and backup

Read-only Azure inventory found two existing protected Ice Free-plan SWAs and no PUB-20 resource. The production API plan remained S2/capacity 2 with two instances. Current API, dependency readiness, Admin, and starter probes returned HTTP 200. Active deployment IDs were recorded outside the repository.

Authenticated customer/data-plane counts were not collected after the hard stop because doing so would introduce login/session side effects. The immediately preceding production smoke evidence remains preserved; this attempt created no new authenticated session, customer readback, or data mutation.

Rollback was therefore a no-op: retain the unchanged pre-entry live state and the immutable INT-10 artifact.
