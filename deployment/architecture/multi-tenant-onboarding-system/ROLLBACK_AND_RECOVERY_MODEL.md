# Rollback and Recovery Model

## Rollback Principles

- Document rollback before production cutover.
- Assign a rollback owner before production cutover.
- Roll back the smallest system that caused the problem.
- Preserve unrelated systems such as email DNS, media DNS, and other tenants.
- Validate after rollback with read-only checks.
- Never rotate secrets, redeploy, or change unrelated config as part of rollback unless separately approved.

## Rollback Classes

| Class | Example |
| --- | --- |
| content rollback | Revert CMS import or redeploy known-good static artifact. |
| media rollback | Disable media route or restore prior media URL mapping. |
| form rollback | Change delivery mode to no-email or disable live delivery under approval. |
| DNS rollback | Restore captured pre-cutover root/`www` records only. |
| hosting rollback | Revert deployment or remove custom domain after traffic rollback. |
| indexing delay | Do nothing in Search Console because indexing was not started. |

## Recovery Package

Every production cutover package should include current state, rollback plan, responsible owner, exact target resources, validation commands, and a boundary list of what must not be touched.

