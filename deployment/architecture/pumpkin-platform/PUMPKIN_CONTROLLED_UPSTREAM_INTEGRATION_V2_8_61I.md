# Pumpkin Controlled Upstream Integration V2.8.61I

Status: completed source integration, no deploy.

SDI-AI upstream main commit `565a8afd669a42224a9d15759f7060faa375d000` was treated as an immutable partner baseline. V2.8.61I did not merge, pull, rebase, or cherry-pick.

Adopted:

- `apps/starter-app/` as an additive local future tenant starter.

Adapted:

- starter form/admin response handling for active Pumpkin API shape;
- starter form editor metadata for active FormDefinition shape;
- TS form model compatibility exports;
- FormBlock select option rendering.

Preserved:

- active Pumpkin API route aliases;
- standalone Admin UI;
- DomainBinding, Backup Manager, Package Intake, OperatorHandoff, ImportExecution, OutboundLinks, static-contact, and Airstrip cutover state.
