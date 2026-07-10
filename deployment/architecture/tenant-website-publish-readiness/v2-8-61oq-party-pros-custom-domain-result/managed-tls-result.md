# Managed TLS Result

Status: not bound.

Managed TLS was attempted after hostname binding. The Azure CLI managed-certificate command exceeded the command timeout. No indefinite retry was performed.

Final readback:

| Hostname | SSL state | Thumbprint |
| --- | --- | --- |
| `partyrentalphiladelphia.com` | `Disabled` | null |
| `www.partyrentalphiladelphia.com` | `Disabled` | null |

Certificate inventory readback for the Party Pros hostnames returned an empty list.

`httpsOnly` remains `false`.

No App Service managed certificate is currently bound for either Party Pros hostname. HTTPS custom-domain proof was skipped because TLS did not become active.
