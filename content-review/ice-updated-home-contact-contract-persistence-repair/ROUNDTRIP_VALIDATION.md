# Roundtrip Validation

## Command

`dotnet run --project tools/dotnet-page-contract/Pumpkin.PageContractTool.csproj -- validate-updated-home-contact --home-path content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json --contact-path content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json`

## Result

- Exit code: 0
- Updated home/contact persistence contract: passed
- Output artifact: `roundtrip-validation-result.json`

## Contract Coverage

The validator checks paired updated home/contact candidates for:

- Required domain routing fields: domain, public email display policy, selected mailbox, selected mailbox metadata, lead-recipient ref, static-endpoint ref, mailto policy, and hidden public contact email.
- Required homepage page-level media slots with tenant-prefixed `mediaAssetId` values.
- Contact form production persistence fields including `formKey`, `sourcePage`, `staticEndpointRef`, `leadRecipientRef`, `selectedMailboxMetadata`, and `emailSendingEnabled`.
- Recursive production-render compatibility fields used by the updated package.

## Artifact Snapshot

`{
  "Command": "validate-updated-home-contact",
  "TargetPath": "C:\\Users\\User\\Desktop\\PumpkinCMS\\pumpkin-cms\\content-review\\ice-updated-home-contact-validated\\UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json;C:\\Users\\User\\Desktop\\PumpkinCMS\\pumpkin-cms\\content-review\\ice-updated-home-contact-validated\\UPDATED_CONTACT_NORMALIZED_CANDIDATE.json",
  "GeneratedAt": "2026-06-03T01:37:56.5915134Z",
  "Rule": "CMS-ready/import-candidate/production-bound page JSON must deserialize through .NET Page/block classes and pass contract validation before CMS import or static production use.",
  "Ok": true,
  "ReadinessDecision": "dotnet-contract-valid-not-cms-import-ready",
  "Pages": [
    {
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json",
      "PageId": "ice-rink-rentals-home",
      "PageSlug": "home",
      "TenantId": "ice-rink-rentals",
      "DotNetDeserialized": true,
      "RoundTripOk": true,
      "ProductionFieldPersistenceOk": true,
      "UpdatedHomeContactPersistenceOk": true,
      "BlockCount": 10,
      "BlockTypes": [
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
      ],
      "ErrorCount": 0,
      "WarningCount": 6
    },
    {
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json",
      "PageId": "ice-rink-rentals-contact",
      "PageSlug": "contact",
      "TenantId": "ice-rink-rentals",
      "DotNetDeserialized": true,
      "RoundTripOk": true,
      "ProductionFieldPersistenceOk": true,
      "UpdatedHomeContactPersistenceOk": true,
      "BlockCount": 10,
      "BlockTypes": [
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
      ],
      "ErrorCount": 0,
      "WarningCount": 6
    }
  ],
  "FormDefinitions": [],
  "MediaRequirements": [
    {
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json",
      "RequirementCount": 6,
      "BlockerCount": 0
    },
    {
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json",
      "RequirementCount": 6,
      "BlockerCount": 0
    }
  ],
  "Errors": [],
  "Warnings": [
    {
      "Severity": "warning",
      "Code": "page.reviewOnlyField",
      "Message": "Root field \"reviewMetadata\" is review/import-candidate metadata and is not part of the canonical .NET Page model.",
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json"
    },
    {
      "Severity": "warning",
      "Code": "page.reviewOnlyField",
      "Message": "Root field \"mediaRequirements\" is review/import-candidate metadata and is not part of the canonical .NET Page model.",
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json"
    },
    {
      "Severity": "warning",
      "Code": "page.reviewOnlyField",
      "Message": "Root field \"templatePurpose\" is review/import-candidate metadata and is not part of the canonical .NET Page model.",
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json"
    },
    {
      "Severity": "warning",
      "Code": "page.reviewOnlyField",
      "Message": "Root field \"contentPackageVersion\" is review/import-candidate metadata and is not part of the canonical .NET Page model.",
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json"
    },
    {
      "Severity": "warning",
      "Code": "productionFieldPersistence.checked",
      "Message": "Verified 200 production renderer/media/email-policy field(s) through the .NET Page/block round trip.",
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json"
    },
    {
      "Severity": "warning",
      "Code": "updatedHomeContactPersistence.checked",
      "Message": "Verified 200 updated home/contact renderer/media/contact-policy field(s) through the .NET Page/block round trip.",
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json"
    },
    {
      "Severity": "warning",
      "Code": "page.reviewOnlyField",
      "Message": "Root field \"reviewMetadata\" is review/import-candidate metadata and is not part of the canonical .NET Page model.",
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json"
    },
    {
      "Severity": "warning",
      "Code": "page.reviewOnlyField",
      "Message": "Root field \"mediaRequirements\" is review/import-candidate metadata and is not part of the canonical .NET Page model.",
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json"
    },
    {
      "Severity": "warning",
      "Code": "page.reviewOnlyField",
      "Message": "Root field \"templatePurpose\" is review/import-candidate metadata and is not part of the canonical .NET Page model.",
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json"
    },
    {
      "Severity": "warning",
      "Code": "page.reviewOnlyField",
      "Message": "Root field \"contentPackageVersion\" is review/import-candidate metadata and is not part of the canonical .NET Page model.",
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json"
    },
    {
      "Severity": "warning",
      "Code": "productionFieldPersistence.checked",
      "Message": "Verified 201 production renderer/media/email-policy field(s) through the .NET Page/block round trip.",
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json"
    },
    {
      "Severity": "warning",
      "Code": "updatedHomeContactPersistence.checked",
      "Message": "Verified 205 updated home/contact renderer/media/contact-policy field(s) through the .NET Page/block round trip.",
      "File": "C:/Users/User/Desktop/PumpkinCMS/pumpkin-cms/content-review/ice-updated-home-contact-validated/UPDATED_CONTACT_NORMALIZED_CANDIDATE.json"
    }
  ]
}`
