# Import Preflight Result

## Homepage
- Shape: valid
- Local draft import: valid
- CMS import: blocked
- Static regeneration: blocked
- Production: blocked
- Warnings: 2

## Contact
- Shape: valid
- Local draft import: valid
- CMS import: blocked
- Static regeneration: blocked
- Production: blocked
- Warnings: 1

## Exact CMS Import Blockers
Homepage:
- workflow.approvedForImport: workflow.approvedForImport is not true.
- workflow.reviewStatus: Human approval is not recorded.
- domainRouting.publicContactEmail: Public email display policy remains unresolved or intentionally hidden.
- domainRouting.primaryPhone: Primary phone/public contact policy remains unresolved or intentionally hidden.

Contact:
- workflow.approvedForImport: workflow.approvedForImport is not true.
- workflow.reviewStatus: Human approval is not recorded.
- domainRouting.publicContactEmail: Public email display policy remains unresolved or intentionally hidden.
- domainRouting.primaryPhone: Primary phone/public contact policy remains unresolved or intentionally hidden.

## Exact Static / Production Blockers
Homepage static:
- staticPublishing.staticEligible: staticPublishing.staticEligible is not true.

Homepage production:
- workflow.approvedForPublish: workflow.approvedForPublish is not true.
- workflow.reviewStatus: Human approval is not recorded.
- domainRouting.publicContactEmail: Public email display policy remains unresolved.
- domainRouting.primaryPhone: Primary phone/public contact policy remains unresolved.
- staticPublishing.staticEligible: staticPublishing.staticEligible is not true.

Contact static:
- staticPublishing.staticEligible: staticPublishing.staticEligible is not true.

Contact production:
- workflow.approvedForPublish: workflow.approvedForPublish is not true.
- workflow.reviewStatus: Human approval is not recorded.
- domainRouting.publicContactEmail: Public email display policy remains unresolved.
- domainRouting.primaryPhone: Primary phone/public contact policy remains unresolved.
- staticPublishing.staticEligible: staticPublishing.staticEligible is not true.

## Output Reports
- homepage-import-preflight-result.json
- contact-import-preflight-result.json
- dotnet-page-contract-result.json
