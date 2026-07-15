# Cosmos and bounded diagnostic proof

The provider is Cosmos SQL authenticated by connection string/account key. Managed identity and Cosmos RBAC are not in the active path.

The legacy cross-partition email query was replaced by a `UserAccounts` global-partition locator and legacy `User` point read. Five locators were additively repaired and nine comparisons had zero mismatches. Endpoint discovery is pinned with `LimitToEndpoint` and a bounded request timeout.

The retained cold diagnostic initially completed in 5.625 seconds; warm runs completed in 1.219-2.281 seconds. Corrected-candidate cold diagnostic completed in 1.136 seconds with exactly one result. It performs no password verification, audit, last-login update, or write.
