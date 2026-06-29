# V2.8.33B Static Contact Upstream Probe Bridge Repair Result

Classification: `static_contact_bridge_repaired_and_production_admin_readback_confirmed`.

V2.8.33B used the completed V2.8.33A result and the approved ignored secure file `.tmp/v2-8-33b/secure/static-contact-upstream-probe-repair.json`.

The phase proved the static-contact 502 was caused by the Pumpkin API tenant-key validation path returning HTTP 401 behind the bridge. The source-required `Tenant` container/document was aligned for `ice-rink-rentals`, the bridge was hardened to preserve public-safe upstream statuses, and both isolated and production static-contact submissions were Admin-visible.

No DNS/custom-domain mutation, indexing action, inbox/provider access, appsettings list/show, Key Vault query, keys/listKeys, SAS generation, or unapproved protected config read occurred.
