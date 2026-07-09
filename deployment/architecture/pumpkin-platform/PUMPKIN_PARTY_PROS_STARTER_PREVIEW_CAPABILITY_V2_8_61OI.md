# Pumpkin Party Pros Starter Preview Capability V2.8.61OI

Status: blocked by source gap under approved OI constraints.

Party Pros cannot yet be previewed on the shared starter live host without additional approved work.

Confirmed capabilities:

- Starter default host is reachable.
- Starter can render bundled fallback home content.
- Starter source can fetch published CMS pages when tenant id, API URL, and tenant API key are configured.
- Starter `/admin` remains tenant-site-local.

Confirmed blockers:

- The live starter host has no Party Pros tenant binding.
- The live starter host has no tenant API key appsetting name.
- Party Pros pages are unpublished.
- The site runtime uses published page endpoints.
- There is no source-supported unpublished preview route.
- There is no source-supported compiled package fixture adapter.
- There is no static Party Pros preview route.

No Party Pros preview route was invoked, because the source-supported precondition was not met.

