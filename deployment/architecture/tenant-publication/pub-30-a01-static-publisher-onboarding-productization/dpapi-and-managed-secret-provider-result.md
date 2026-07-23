# DPAPI and managed-secret provider result

## Current provider

The approved fixture remains a Windows DPAPI `CurrentUser` envelope. Entry checks verified the expected envelope hash, operator-and-SYSTEM ACL boundary, same-profile in-memory decrypt round trip, and zero plaintext token files. PUB-30 did not rotate, copy, print, commit, or place the deployment token on a command line.

The product provider separates metadata from execution. It validates envelope format, provider/scope, ACL and hash/status metadata; permits decrypted material only in a child-process environment; suppresses child output; and clears that environment after exit. Token reset and rotation are unsupported by the product service.

The provider is valid only for the approved single-operator fixture. It is not portable across Windows profiles and is not a multi-operator automation solution.

## Managed multi-operator provider

A future managed-secret-provider interface is design-only. It requires value-free references, least-privilege retrieval, auditable version/supersession state, child-process-only delivery, and explicit rotation/recovery workflows. No paid secret store was created or authorized.

## Security interruption

A separate read-only API settings hash diagnostic exposed protected API configuration values only in command trace. The affected classes were Cosmos authentication material, the JWT signing secret, and the public-form ticket-signing key; the SWA deployment token was not affected. No protected value is present in source, a file, a commit, this result package, a browser bundle, or an Atlas input, and no live mutation occurred. The repository-safe containment record SHA-256 is `5c5a1c7be41a669b1f6ca0611d8e2acd06af4a923d6f9930a507cc8198c7370d`.

Required owner decision: authorize `PLATFORM_SECRET_ROTATION_AND_PARITY_RECOVERY`, including bounded rotation/invalidation, secure operator handoff, production-parity configuration recovery, and authoritative readback. Separately decide whether SEC-20 should replace same-user DPAPI for multi-operator operation.
