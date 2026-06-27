# Protected Binding Values Presence Only

Protected values were checked by presence only and were not printed.

| Env name | Presence | Use in this phase |
| --- | --- | --- |
| `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` | present | Bound to the Static Web App as the source-selected tenant API key value. |
| `PUMPKIN_API_FORMENTRY_PROVIDER_BINDING_SECRET` | present | Used only for operator-side match proof; not source-confirmed as an API app setting. |
| `PUMPKIN_API_JWT_SECRET_KEY` | absent | Not bound; no API appsetting mutation occurred. |

The two operator-provided tenant API key env values matched exactly. No protected value was written into reports, manifests, logs, or evidence files.
