# Provider Profile Binding Requirements

Provider Profile bindings must include:

- provider profile ID;
- deployment profile name;
- tenant/site applicability;
- supported route/content/media/form capabilities;
- read-only versus write-capable classification;
- required future approvals for writes, deployment, DNS, indexing, and secrets.

Current Ice proven profile:

- `static-azure-cloudflare-worker-graph`

Rules:

- provider profile binding does not authorize provider writes;
- live provider integration remains closed;
- profile references must be explicit and non-secret.
