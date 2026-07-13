# Pumpkin Tenant Redirect Contract Validation Standard V2.8.62DRS

Redirect validation must run before dependent live mutation and model both source semantics and the exact API persistence operation.

Required checks:

1. Decode and normalize source and target while preserving host, scheme, query, fragment, case policy, trailing slash, extension, locale, and terminal index semantics.
2. Inspect static canonical, meta-refresh, link, moved-page, and script-location evidence without executing uploaded code.
3. Verify target existence and source/target declaration agreement.
4. Build the full redirect graph and reject direct or multi-node cycles.
5. Distinguish canonical no-ops and client anchors from persisted server redirects.
6. Model create/update merge behavior; a request accepted by a guard is insufficient if persistence drops it.
7. Fail closed when meaningful behavior is unsupported.
8. Prohibit direct database repair as normal onboarding reconciliation.
9. Read back every persisted redirect and keep attempt counts separate from stored counts.

The durable semantic validator and focused suite under `tenant-onboarding-package/v1/tools/page-contract-validator` implement these classifications.
