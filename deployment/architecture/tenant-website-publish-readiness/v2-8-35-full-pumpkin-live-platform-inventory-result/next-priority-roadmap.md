# Next Priority Roadmap

Priority 1: CMS data/container alignment preflight.

- Decide whether production API source should use singular containers or lower/plural containers.
- Confirm whether existing lower/plural containers contain intended CMS records.
- Produce a no-delete migration/alignment plan.

Priority 2: Admin API proof and Admin UI deployment preflight.

- Re-run bounded Admin login/readback proof without printing secrets.
- Confirm live API CORS/auth behavior for a future Admin host.
- Approve dedicated Admin UI SWA deployment target.

Priority 3: Production monitoring and backup hardening.

- Add diagnostic settings and alerts.
- Harden App Service backup/artifact recovery.
- Enable media storage soft delete/versioning/change feed as approved.

Priority 4: Cleanup approval.

- Remove empty fallback groups only after confirmation.
- Decommission legacy static form Function App only after no-traffic proof.

Priority 5: Broader CMS controlled validation.

- Validate page editor, media management, publish/import, themes, rollback, tenant management, and multi-tenant flows one lane at a time.
