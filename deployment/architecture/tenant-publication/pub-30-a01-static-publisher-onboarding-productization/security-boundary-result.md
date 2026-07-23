# Security boundary result

## Preserved boundaries

- no secret value is represented in publisher, registry, job, Admin UI, static artifact, result document, or browser contract;
- the current SWA credential remains a same-profile DPAPI `CurrentUser` fixture with restricted ACL metadata and zero plaintext token files;
- child-process delivery forbids command-line credentials, output capture, and retained environment values;
- customer execution, indexable publication, domains/DNS/TLS, Airstrip, paid infrastructure, payments, and external email remain disabled or held;
- no customer payload, ticket, credential, raw log, package, browser profile, or private absolute path is included here.

## Protected-value exposure

A read-only API settings hash diagnostic exposed protected API configuration values only in the command trace. Affected classes were Cosmos authentication material, the JWT signing secret, and the public-form ticket-signing key. The SWA deployment token was not affected. The command did not write a file, stage or commit data, change live configuration, deploy code, issue a ticket, or submit a form. This package records the event without reproducing any affected value.

The repository-safe containment record has SHA-256 `5c5a1c7be41a669b1f6ca0611d8e2acd06af4a923d6f9930a507cc8198c7370d`. Because affected-platform-secret rotation was outside PUB-30 authority, the correct response was to halt all deployment and retained-synthetic mutation. Required new `PLATFORM_SECRET_ROTATION_AND_PARITY_RECOVERY` authority must cover affected-platform-secret rotation, invalidation where supported, secure operator handoff, production-parity configuration recovery, and authoritative customer/synthetic no-regression readback.

Current security outcome: `blocked_dpapi_provider_or_deployment_security`.
