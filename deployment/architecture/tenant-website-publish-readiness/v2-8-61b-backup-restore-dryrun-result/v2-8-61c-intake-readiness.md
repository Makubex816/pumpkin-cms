# V2.8.61C Intake Readiness

Status: ready for separate approval.

V2.8.61B proves a local restore dry-run can validate the Airstrip backup bundle and produce restore planning outputs.

Recommended V2.8.61C scope:

- Design live restore adapter contracts without executing live restore.
- Define restore target selection and safety rails.
- Define identity/password reset workflow.
- Define media restore write policy without storage keys/listKeys/SAS unless separately approved.
- Define DomainBinding pending/non-live restore semantics.
- Define Admin UI Backup Manager read-only intake surface.
- Keep DNS, deploy, indexing, form/contact POST, and live mutation out of scope unless separately approved.
