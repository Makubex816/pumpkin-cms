# Import Preflight Result

Preflight output: `content-review/ice-homepage-phase8n-crm-scaffold-validated/phase8n-import-preflight-result.json`

Summary:

- Shape valid: yes
- Local draft import shape valid: yes
- CMS import ready: no
- Production ready: no
- .NET Page contract: passed
- Warnings: 2
- Errors: 0

Expected warning:

- Homepage has no `formBlock`; Phase 8N intentionally routes CTAs to `/contact`.

CMS import blockers from preflight:

- workflow.approvedForImport: workflow.approvedForImport is not true.
- workflow.reviewStatus: Human approval is not recorded.
- domainRouting.publicContactEmail: Public email display policy remains unresolved or intentionally hidden.
- domainRouting.primaryPhone: Primary phone/public contact policy remains unresolved or intentionally hidden.

Static regeneration blockers:

- staticPublishing.staticEligible: staticPublishing.staticEligible is not true.

Production blockers:

- workflow.approvedForPublish: workflow.approvedForPublish is not true.
- workflow.reviewStatus: Human approval is not recorded.
- domainRouting.publicContactEmail: Public email display policy remains unresolved.
- domainRouting.primaryPhone: Primary phone/public contact policy remains unresolved.
- staticPublishing.staticEligible: staticPublishing.staticEligible is not true.

Draft overwrite decision for this run:

- Not attempted because admin auth was missing from `PUMPKIN_ADMIN_JWT` and the allowed temp JWT file.
