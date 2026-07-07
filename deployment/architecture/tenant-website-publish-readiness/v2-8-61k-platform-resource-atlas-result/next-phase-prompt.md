# Next Phase Prompt

Approve V2.8.61L Owner Resource Atlas Review And Decision Packet only.

Use the completed V2.8.61K platform resource atlas to walk the owner through:

- production resources that must not be deleted;
- isolated/staging/proof resources that should be retained;
- Airstrip frozen custom-domain state;
- legacy/deferred resources that require dependency proof before cleanup;
- possible cleanup candidates;
- known gaps and pending approvals.

Scope:

- read-only owner review;
- no Azure mutation;
- no deploy;
- no appsetting value read;
- no keys/listKeys;
- no SAS;
- no DNS/custom-domain action;
- no indexing;
- no contact POST;
- no form submission;
- no media mutation;
- no tenant/content/user/role/DomainBinding mutation;
- no Airstrip route probe unless separately approved;
- no staging of hardcopies, backup bundles, external clones, `.tmp`, node_modules, or generated artifacts;
- no `git add -A`.

Optional owner decisions to collect:

1. Whether to resume Airstrip custom-domain cutover with a new secure DNS handoff.
2. Whether to run a separate no-mutation diagnostic settings reconciliation.
3. Whether to authorize a legacy static-contact dependency-proof decommission phase.
4. Whether to authorize outbound-link-manager staging dependency proof.
5. Whether to authorize a starter app isolated Azure sandbox proof.

Acceptance:

- owner-readable decision packet exists;
- no raw secrets are written;
- exact next approvals are separated by risk area.
