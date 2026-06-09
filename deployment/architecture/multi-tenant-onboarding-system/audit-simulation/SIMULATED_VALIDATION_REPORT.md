# Simulated Validation Report

| Field | Value |
| --- | --- |
| tenant | `example-event-rentals` |
| site key | `example-event-rentals` |
| gate | import-package |
| status | warning |
| external mutation performed | no |

## Findings

| Severity | Code | Message | Blocks gate |
| --- | --- | --- | --- |
| warning | `OWNER_TBD` | Production cutover owner and rollback owner are still TBD. | yes for production cutover |
| warning | `MEDIA_RIGHTS_PENDING` | Media usage rights are not confirmed. | yes for production |
| info | `INDEXING_FINAL_GATE` | Search Console/indexing remains blocked until final owner approval. | yes for indexing |

## Next Actions

- Assign production cutover owner.
- Assign rollback owner.
- Confirm media usage rights.
- Keep CMS import, deployment, DNS, email, and indexing blocked until explicit gate approval exists.
