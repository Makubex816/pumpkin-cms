# Rollback Abort Display Plan

Rollback display fields:

- `rollbackPlanId`;
- abort state;
- future execution gate required;
- related validation refs;
- related no-go conditions;
- owner/operator approval status;
- last safe preview timestamp.

Ice:

- show `rollback:v2-8-17d-production-rollback-plan`.

Roller:

- show `rollback:paused-no-import-abort-plan`.

The panel does not run rollback and does not create abort records.
