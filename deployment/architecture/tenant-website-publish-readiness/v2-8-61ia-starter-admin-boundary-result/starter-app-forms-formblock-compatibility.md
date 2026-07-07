# Starter App Forms FormBlock Compatibility

Status: source-compatible.

Starter public rendering:

- `apps/starter-app/src/lib/pumpkin-api.ts` fetches form definitions from Pumpkin API;
- `apps/starter-app/src/components/PageRenderer.tsx` passes definitions into `BlockViewRenderer`;
- `ContactFormBlock` renders contact definitions and posts through the starter API bridge;
- V2.8.61I preserved string and object option compatibility.

Starter tenant-local admin:

- form definitions are listed, created, updated, and deleted through tenant-scoped admin form routes;
- created definitions include active repo metadata required by FormDefinition validation;
- no platform form-entry review or cross-tenant forms console was added to starter `/admin`.

No live form submission was run in this phase.
