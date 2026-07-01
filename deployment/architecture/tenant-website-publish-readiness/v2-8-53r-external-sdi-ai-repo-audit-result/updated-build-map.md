# Updated Build Map

## Current Priority

External SDI-AI repo compatibility now takes priority over tenant expansion.

## Build Order

1. V2.8.53R external audit and compatibility map: completed.
2. V2.8.53S external compatibility adapter implementation preflight: next approval required.
3. Add/restore external route aliases.
4. Convert hard-coded tenant/site/publish/static-contact maps to tenant profile registry.
5. Reconcile provider metadata/source container naming.
6. Run source tests and GET-only no-regression.
7. Resume V2.8.53 controlled secondary tenant creation preflight.
8. Continue secondary tenant package import/media/public/admin/publish/contact gates only after creation approval.

## Hard Stops

No tenant creation, deploy, Azure/appsetting mutation, DNS/indexing, contact POST, form submission, or media upload before compatibility remediation is approved and proven.
