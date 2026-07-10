# Party Pros TLS Runtime Proof V2.8.61OQ

Status: TLS not active.

Managed TLS was attempted after custom hostname binding. The Azure CLI managed-certificate command exceeded the command timeout, and final readback showed no certificate bound.

Final TLS readback:

| Hostname | SSL state | Thumbprint |
| --- | --- | --- |
| `partyrentalphiladelphia.com` | `Disabled` | null |
| `www.partyrentalphiladelphia.com` | `Disabled` | null |

Additional readback:

- App Service certificate list for Party Pros hostnames: empty.
- `httpsOnly=false`.

Decision:

- Custom-domain HTTPS proof is held.
- HTTPS-only was not enabled.
- Next phase should complete managed TLS or document the exact Azure blocker.
