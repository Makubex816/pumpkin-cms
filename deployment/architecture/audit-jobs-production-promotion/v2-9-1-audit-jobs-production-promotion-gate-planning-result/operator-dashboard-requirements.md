# Operator Dashboard Requirements

Result: complete.

Future operator dashboard surfaces should be read-only by default and should make live/write/deploy/indexing boundaries visibly closed until an explicit approval exists.

Required views:

- Audit event timeline with filters by V2 reference, tenant, site, event type, outcome, and boundary gate.
- Job/run ledger with status, job type, attempt count, retry count, evidence refs, and mutation flags.
- Production promotion gate checklist with pass/block/defer/waive states.
- Evidence map view showing V2.8 release, contact-form verification, Runtime QA, Backup Center, Resource Registry, Provider Profile, and OLM bindings.
- Safety boundary panel showing deployment, DNS, Search Console/indexing, contact POST, CMS/provider write, Azure mutation, RBAC, protected config, token, keys/listKeys, connection string, and SAS status.
- Next-boundary prompt panel with exact approval text and not-approved actions.

Required dashboard safeguards:

- No write buttons unless a future phase explicitly adds write workflow controls.
- No token or protected config display.
- No live crawl/outbound URL action.
- No Search Console/indexing action.
- No contact-form POST action.
- No deployment or DNS/custom-domain action.

