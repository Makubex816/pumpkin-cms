# Production Cutover Runbook

1. Confirm staging passed.
2. Confirm production cutover owner.
3. Confirm DNS owner.
4. Confirm rollback owner.
5. Capture pre-cutover safe DNS/hosting state.
6. Confirm records that must not change.
7. Request production cutover approval.
8. If approved later, perform only the approved cutover actions.
9. Run production smoke.
10. Document result and rollback status.

Do not change DNS, Azure, Cloudflare, deployment, or CMS without exact approval.

