# Open Decisions

| Decision | Status | Notes |
| --- | --- | --- |
| Backup artifact storage provider | open | Needs implementation choice and cost/security review |
| Database export format per environment | open | Azure SQL BACPAC or equivalent expected |
| Encryption implementation | open | Choose envelope encryption, public-key encryption, or managed KMS/HSM blend |
| Escrow recipient key custody | open | Owner-approved secure custody process required |
| Multi-party approval threshold | open | Recommended for full platform escrow |
| Default retention windows | open | Needs owner/legal/operations decision |
| Backup Center UI permission source | open | Should align with admin auth/RBAC model |
| Restore sandbox target | open | Needs local/sandbox environment definition |
| Media binary export strategy | open | Needs blob storage implementation details |
| Escrow restore rotation policy | open | Decide when restored credentials must be rotated |

## Blocking Decisions

Escrow cannot be implemented safely until encryption, recipient custody, and approval thresholds are decided. Restore cannot be considered production-ready until sandbox target and retention policy are defined.
