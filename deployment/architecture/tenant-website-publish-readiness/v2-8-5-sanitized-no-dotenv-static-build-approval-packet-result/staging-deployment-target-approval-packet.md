# Staging Deployment Target Approval Packet

Status: incomplete; exact target approval required before any staging execution.

V2.8.5 did not approve or perform deployment. This packet defines the minimum exact target data required for a future staging execution prompt.

## Required Target Fields

| Field | Required value |
| --- | --- |
| Tenant/site key | `ice-rink-rentals` |
| Candidate domain | `iceskatingrinkrentals.com` |
| Staging host/domain | Exact hostname to receive the staged static output |
| Deployment platform | Exact target platform, such as Azure Static Web Apps or Azure Storage static website |
| Azure subscription | Approved subscription identifier or approved redacted reference |
| Resource group | Approved resource group name |
| Target resource name | Approved Static Web App or storage account/static website target |
| Upload root | Confirmed folder root for the static package contents |
| Build artifact source | Sanitized no-dotenv output from the latest approved run |
| DNS behavior | Confirm whether DNS changes are out of scope or separately approved |
| Rollback target | Approved previous package or empty-staging rollback behavior |
| Operator | Named operator who will run the future deploy command |
| Approver | Named owner approving target and staging execution |

## No-Go Conditions

Do not execute staging deployment if any of these are true:

- static form endpoint/backend verification is missing
- final media/content approval is missing
- exact target fields are incomplete
- target points to production instead of staging
- the operation would require keys/listKeys, connection strings, or SAS
- the operation would require reading protected config
- DNS/indexing/live publication is implied instead of separately approved
- generated `.tmp` artifacts would be staged into Git
