# Import Preflight Repair

## Homepage Preflight After Repair

| exitCode | shape | localDraftImport | cmsImport | production | updatedHomeContactPersistenceOk | warningCount | errorCount |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | true | true | false | false | true | 3 | 0 |

Warnings:

- production-service-area-copy: Homepage copy includes East Coast wording; keep it in manual review before production approval.
- default-form: Homepage has no formBlock.
- dotnet-page-contract: The .NET contract returned 6 warning(s).

Errors:

- None

## Contact Preflight After Repair

| exitCode | shape | localDraftImport | cmsImport | production | updatedHomeContactPersistenceOk | warningCount | errorCount |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | true | true | false | false | true | 1 | 0 |

Warnings:

- dotnet-page-contract: The .NET contract returned 6 warning(s).

Errors:

- None

## Repair Summary

The preflight now runs the updated home/contact persistence path for production-render-compatible candidates, including route-aware variants. It publishes the .NET contract tool to a temp path before validation and treats missing updated persistence fields as a preflight failure.

The candidates are valid for local draft import shape. They remain intentionally not valid for CMS import or production because this is a review-only package.
