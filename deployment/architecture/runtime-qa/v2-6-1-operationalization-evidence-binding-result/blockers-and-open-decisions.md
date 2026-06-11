# Blockers And Open Decisions

No local Runtime QA operationalization blockers remain.

Open blocker:

- Runtime QA staging evidence upload is blocked until the approved operator/session has Storage Blob Data Reader or Storage Blob Data Contributor-style data-plane permission on `runtime-qa-staging`. No RBAC change was made in V2.6.1.

Still separately gated:

- Any new OLM staging provider write.
- Any Azure infrastructure mutation or RBAC assignment.
- Any production database migration or production write.
- Any CMS write.
- Any deployment, indexing, or live publication.
