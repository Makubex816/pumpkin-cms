# Data Model Draft

This is a planning model, not implementation code.

## OnboardingSession

- `sessionId`
- `tenantId`
- `siteKey`
- `status`
- `currentStep`
- `createdBy`
- `createdAt`
- `updatedAt`
- `draftVersion`
- `schemaVersion`
- `builderVersion`
- `validatorVersion`
- relationships: one TenantDraft, many ValidationRuns, many SupportPackets, many ApprovalGates

## TenantDraft

- `tenantDisplayName`
- `tenantId`
- `siteKey`
- `businessType`
- `cmsTenantSlug`
- `tenantApiKeyPresence`
- `relatedTenants`
- `pausedRelatedTenants`
- relationships: one DomainDraft, many PageDrafts, many MediaDrafts, many FormDrafts

## DomainDraft

- `primaryDomain`
- `wwwDomain`
- `mediaDomain`
- `stagingHostname`
- `canonicalHost`
- `dnsOwnerRef`
- `searchConsolePropertyMetadata`

## PageDraft

- `pageId`
- `slug`
- `route`
- `title`
- `status`
- `seoTitle`
- `seoDescription`
- `robots`
- `canonicalUrl`
- `blocks`
- `contentOwnerRef`

## MediaDraft

- `mediaId`
- `fileName`
- `kind`
- `altText`
- `sourceStatus`
- `publicUrl`
- `usageReviewerRef`

## FormDraft

- `formId`
- `displayName`
- `deliveryMode`
- `recipient`
- `mailboxOwnerRef`
- `fields`
- `consentNoticeStatus`
- `rollbackMode`
- `staticEndpointPresence`

## SeoDraft

- `defaultRobots`
- `canonicalBaseUrl`
- `sitemapPolicy`
- `indexingFinalGate`
- `seoOwnerRef`

## DeploymentProfileSelection

- `deploymentProfileId`
- `profileDisplayName`
- `selectedBy`
- `selectedAt`
- `requirementsAcknowledged`
- `deferredExternalActions`

## ValidationRun

- `validationRunId`
- `sessionId`
- `validatorVersion`
- `startedAt`
- `completedAt`
- `overallStatus`
- `summary`
- `gateStatuses`
- `findingCodes`
- `reportPaths`

## SupportPacket

- `supportPacketId`
- `sessionId`
- `validationRunId`
- `exportedBy`
- `exportedAt`
- `files`
- `redactionStatus`
- `sourceFilesCopied`

## ApprovalGate

- `gateId`
- `ownerRef`
- `status`
- `approvedBy`
- `approvedAt`
- `approvalText`
- `invalidatedByFieldChange`

## Relationships

- OnboardingSession owns the draft lifecycle.
- TenantDraft contains tenant-level scope and links to child drafts.
- ValidationRun references the generated package snapshot.
- SupportPacket references a ValidationRun and redacted draft summary.
- ApprovalGate records manual review status and can be invalidated by later field edits.
