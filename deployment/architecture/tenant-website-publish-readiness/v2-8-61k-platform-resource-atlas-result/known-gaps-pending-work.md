# Known Gaps And Pending Work

Known gaps:

- Airstrip custom-domain cutover is still pending manual owner DNS entry and a later approved Azure hostname/TLS phase.
- V2.8.61K did not repeat Airstrip route proof because Airstrip is frozen.
- V2.8.61K did not read appsetting values, Key Vault secrets, storage keys, Cosmos keys, or protected config files.
- V2.8.61K did not verify actual tenant row values from Cosmos because that would require a separate approved authenticated read path or secure handoff.
- Diagnostic setting readback returned no setting rows for sampled resources even though V2.8.45 hardening history remains documented; future monitoring reconciliation may be useful.
- Starter app remains local-only and not deployed to an Azure sandbox.
- Live restore adapter is not implemented.
- Legacy/deferred static contact resources require dependency proof before decommission.
- Older outbound-link-manager staging resources require dependency proof before cleanup.
- External reference clones remain outside this repo and must not be staged.

Pending phases:

- Owner review of this atlas and do-not-delete register.
- Optional V2.8.61L resource atlas reconciliation if the owner wants portal screenshots or deeper Azure-only metadata.
- Separate Airstrip DNS/custom-domain approval if the owner wants to resume cutover.
- Separate cleanup/decommission approval for legacy/deferred resources.
- Separate starter Azure sandbox proof if needed.
- Separate monitoring diagnostic reconciliation if exact diagnostic setting state must be re-proven.
