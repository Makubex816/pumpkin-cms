# Submit-Key Route Activation Proof

No submit key, token, cookie, or secret was sent.

Probe:

| Item | Value |
| --- | --- |
| Method | `POST` |
| Path | `/api/admin/tenants/party-pros-philadelphia/submit-key` |
| Auth | none |
| Body | `{}` |
| HTTP status | `401` |

Interpretation:

HTTP `401` proves the route is live and auth-gated. Before OSE deployment the same no-secret probe returned `404`.

No Party Pros submit key was provisioned in this phase.

