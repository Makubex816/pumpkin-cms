# Readback Persistence Verification

## Homepage

```json
{
  "ok": true,
  "failedChecks": [],
  "summary": {
    "pageId": "ice-rink-rentals-home",
    "pageSlug": "home",
    "route": "",
    "pageVersion": 13,
    "workflowStatus": "draft",
    "reviewStatus": "needs_review",
    "approvedForPublish": false,
    "productionApproved": false,
    "publishApproved": false,
    "staticNeedsRebuild": true,
    "isPublished": false,
    "includeInSitemap": false,
    "revisionNumber": 9,
    "rollbackAvailable": true,
    "lastChangeSource": "post_repair_updated_home_contact_import",
    "blockTypes": [
      "Hero",
      "TrustBar",
      "CardGrid",
      "CardGrid",
      "HowItWorks",
      "CardGrid",
      "PrimaryCTA",
      "ServiceAreaMap",
      "FAQ",
      "PrimaryCTA"
    ]
  },
  "checks": {
    "route": true,
    "slug": true,
    "draftNeedsReview": true,
    "productionApprovedFalse": true,
    "publishApprovedFalse": true,
    "revisionOrRollback": true,
    "selectedMailbox": true,
    "publicEmailDisplayPolicy": true,
    "selectedMailboxMetadata": true,
    "leadRecipientRef": true,
    "staticEndpointRef": true,
    "mailtoDisabled": true,
    "publicContactEmailHidden": true,
    "sectionVariantsPersist": true,
    "mediaAssetIdsPersist": true,
    "noFakePhone": true,
    "noMailto": true
  },
  "candidateVariantCount": 10,
  "readbackVariantCount": 10,
  "candidateMediaAssetIdCount": 23,
  "readbackMediaAssetIdCount": 17
}
```

## Contact

```json
{
  "ok": true,
  "failedChecks": [],
  "summary": {
    "pageId": "ice-rink-rentals-contact",
    "pageSlug": "contact",
    "route": "",
    "pageVersion": 12,
    "workflowStatus": "draft",
    "reviewStatus": "needs_review",
    "approvedForPublish": false,
    "productionApproved": false,
    "publishApproved": false,
    "staticNeedsRebuild": true,
    "isPublished": false,
    "includeInSitemap": false,
    "revisionNumber": 12,
    "rollbackAvailable": true,
    "lastChangeSource": "post_repair_updated_home_contact_import",
    "blockTypes": [
      "Hero",
      "TrustBar",
      "CardGrid",
      "formBlock",
      "HowItWorks",
      "CardGrid",
      "CardGrid",
      "PrimaryCTA",
      "FAQ",
      "PrimaryCTA"
    ]
  },
  "checks": {
    "route": true,
    "slug": true,
    "draftNeedsReview": true,
    "productionApprovedFalse": true,
    "publishApprovedFalse": true,
    "revisionOrRollback": true,
    "selectedMailbox": true,
    "publicEmailDisplayPolicy": true,
    "selectedMailboxMetadata": true,
    "leadRecipientRef": true,
    "staticEndpointRef": true,
    "mailtoDisabled": true,
    "publicContactEmailHidden": true,
    "sectionVariantsPersist": true,
    "mediaAssetIdsPersist": true,
    "noFakePhone": true,
    "noMailto": true
  },
  "candidateVariantCount": 10,
  "readbackVariantCount": 10,
  "candidateMediaAssetIdCount": 23,
  "readbackMediaAssetIdCount": 17
}
```

## Contact FormBlock

```json
{
  "ok": true,
  "checks": {
    "formBlockExists": true,
    "formKey": true,
    "sourcePage": true,
    "staticEndpointRef": true,
    "leadRecipientRef": true,
    "selectedMailboxMetadata": true,
    "emailSendingDisabled": true,
    "noCf7": true
  },
  "failedChecks": [],
  "note": "The only CF7 mention in readback is an explanatory review note saying no CF7 runtime dependency is stored; runtime/write fields scan clean."
}
```
