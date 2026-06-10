# API Request Response Models

This plan defines logical contracts only. Code generation and shared model implementation belong in a later phase.

## Core Records

`OutboundLinkDto`:

- `id`
- `tenantId`
- `siteId`
- `originalUrl`
- `normalizedUrl`
- `domain`
- `status`
- `createdAt`
- `updatedAt`
- `createdBy`
- `disabledBy`
- `disabledAt`
- `disabledReason`
- `instanceCount`
- `activeInstanceCount`
- `staleInstanceCount`
- `pendingReviewCount`
- `etag`

`OutboundLinkInstanceDto`:

- `id`
- `tenantId`
- `siteId`
- `outboundLinkId`
- `pageId`
- `contentType`
- `contentBlockId`
- `fieldName`
- `anchorText`
- `locationPath`
- `isEnabled`
- `status`
- `firstDetectedAt`
- `lastDetectedAt`
- `etag`

`OutboundLinkPolicyDto`:

- `tenantId`
- `siteId`
- `defaultDisabledBehavior`
- `defaultRel`
- `externalTargetBehavior`
- `allowedDomains`
- `blockedDomains`
- `reviewRequiredForNewDomains`
- `updatedAt`
- `etag`

## List Response

All list endpoints should return:

- `items`
- `pageInfo.cursor`
- `pageInfo.nextCursor`
- `pageInfo.limit`
- `pageInfo.hasMore`
- `filters`
- `tenantId`
- `siteId`

## Mutation Requests

`UpdateOutboundLinkStatusRequest`:

- `tenantId`
- `siteId`
- `status`
- `reason`
- `expectedEtag`

`UpdateOutboundLinkInstanceStatusRequest`:

- `tenantId`
- `siteId`
- `status`
- `reason`
- `expectedEtag`

`UpdateOutboundLinkPolicyRequest`:

- `tenantId`
- `siteId`
- `policy`
- `reason`
- `expectedEtag`

`BulkActionRequest`:

- `tenantId`
- `siteId`
- `mode`: `preview` or `execute`
- `action`
- `filters`
- `selectedIds`
- `previewId`
- `expectedCount`
- `reason`
- `idempotencyKey`

## Error Model

Errors should return:

- `code`
- `message`
- `tenantId`
- `siteId`
- `correlationId`
- `details`

Error details must never contain protected config values, bearer credentials, cookies, auth headers, storage credentials, connection strings, or raw private file paths.

