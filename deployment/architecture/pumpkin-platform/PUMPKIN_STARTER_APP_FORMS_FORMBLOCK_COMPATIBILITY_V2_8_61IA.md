# Pumpkin Starter App Forms FormBlock Compatibility V2.8.61IA

The starter app aligns with active form contracts:

- `FormDefinition` is imported from `pumpkin-ts-models`.
- Public pages fetch definitions from Pumpkin API.
- `PageRenderer` passes definitions into `BlockViewRenderer`.
- `FormBlockView` compatibility from V2.8.61I supports active and upstream option shapes.
- Starter tenant-local forms admin works through tenant-scoped admin routes.

Boundary:

- starter `/admin` may design tenant-local form definitions;
- standalone Admin UI remains responsible for platform review, cross-tenant visibility, and form-entry operations.

No live form submission occurred in V2.8.61IA.
