# Missing Nonrecoverable Gap Report

Status: completed.

The V2.8.61A missing/nonrecoverable item report exists and was reviewed for dry-run readiness.

Documented expected gaps:

- Live restore adapter not implemented.
- Secrets and credentials require reset workflow or separate secure handoff.
- DomainBinding restore must remain pending/non-live until separate DNS/custom-domain approval.
- Google Workspace email DNS is out of scope.
- CDN/Front Door is out of scope.
- BackupRun production persistence is not implemented.

Non-blocking bundle metadata gap:

- Airstrip isolated preview host was not recorded in the V2.8.61A resource metadata.
