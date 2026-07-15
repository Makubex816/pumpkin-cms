# Form contract and stage diagnosis

Fixture reconciliation proved 32/32 unique canonical definitions and 65/65 mapped instances. `fidelity-15` is a canonical key used by nine instances, not an instance ID.

Two live data mismatches were found. All definitions were draft, while the public API resolves only active/published definitions. After in-place activation, no-write preflight passed 32/32. Imported API field names were then found normalized to forms such as `privacyconsent` and `tenant-id`, while runtime fixtures submit `privacyConsent` and `tenantId`. This caused prompt validation HTTP 400 before persistence. The generic guard now reconciles case/separator-equivalent field identities.

Transport 1 through the apex timed out without a starter response. Direct starter transports 2 and 3 reached validation and returned HTTP 400 in 4.2 and 3.1 seconds. All three produced zero entries.
