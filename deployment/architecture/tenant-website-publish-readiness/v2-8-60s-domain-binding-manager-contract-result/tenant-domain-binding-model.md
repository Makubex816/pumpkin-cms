# Tenant Domain Binding Model

Status: design complete.

Recommended container:

- Name: `DomainBinding`
- Partition key: `/tenantId`
- Creation in this phase: not performed

The model is a sidecar control-plane ledger, not a replacement for Tenant, Page, Theme, FormDefinition, MediaAsset, PublishRun, or ImportRun records.

## Required Fields

Identity:

- `id`
- `tenantId`
- `siteKey`
- `domain`
- `wwwDomain`
- `displayName`
- `bindingType`: `primary`, `alternate`, `replacement`, or `rollback`
- `canonical`: boolean

Provider:

- `dnsProviderMode`: `manual_dns_packet`, `bluehost_owner_assisted`, `azure_dns_future`, `frontdoor_future`, or `other_future`
- `hostingTargetType`: `app_service`, `static_web_app`, or `front_door_future`
- `targetResourceGroup`
- `targetAppName`
- `targetDefaultHost`
- `targetSubscriptionIdRef`: non-secret reference only

DNS packet:

- `dnsRecordsRequired`: ordered records with type, host, valueRef/value, ttl, purpose, status, and lastObservedValue.
- `dnsPacketVersion`
- `dnsPacketGeneratedAt`
- `dnsValidationStatus`
- `dnsLastCheckedAt`
- `dnsValidationMessages`

Azure binding:

- `hostnameBindingStatus`
- `hostnameBindingAttemptedAt`
- `hostnameBindingCompletedAt`
- `hostnameBindingResultCode`
- `managedCertificateStatus`
- `tlsStatus`
- `tlsLastCheckedAt`
- `tlsMessages`

Runtime proof:

- `runtimeProofStatus`
- `runtimeProofLastCheckedAt`
- `runtimeProofRoutes`
- `runtimeProofSummary`

Promotion:

- `promotionStatus`
- `promotedAt`
- `promotedBy`
- `previousCanonicalDomain`
- `previousCanonicalWwwDomain`

Rollback:

- `rollbackStatus`
- `rollbackTargetBindingId`
- `rollbackReason`
- `rollbackStartedAt`
- `rollbackCompletedAt`

Audit:

- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`
- `auditEvents`

## Audit Event Shape

Each audit event should include:

- `id`
- `at`
- `actorUserId`
- `actorEmail`
- `actorRole`
- `action`
- `fromState`
- `toState`
- `summary`
- `evidenceRefs`
- `nonSecretDiff`
- `approvalRef`

Audit events must never store provider credentials, session cookies, one-time codes, private keys, or deployment tokens.

## Relationship To Existing Models

- Tenant remains the tenant identity and CORS-origin holder.
- Page SEO canonical fields remain content-level metadata and are updated only after promotion is approved.
- PublishRun records remain publish/deploy evidence and can reference a DomainBinding by id in a future optional field.
- Media, forms, themes, and users remain tenant scoped and are not duplicated or moved.

