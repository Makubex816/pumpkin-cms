# Delivery Mode Behavior Matrix

| Mode | Behavior | Admin persistence result |
| --- | --- | --- |
| `dry-run` | Validates and returns accepted local ID | No persistence |
| `no-email` | Alias of dry-run behavior | No persistence |
| missing/unknown | Falls back to dry-run | No persistence |
| `graph` or `m365-graph` | Sends email through Graph when separately configured | No Pumpkin `FormEntry` |
| `pumpkin-api` | Requires `PUMPKIN_API_URL` and selected protected API key, then posts `FormEntry` to Pumpkin API | Admin-visible if bound to same backend Admin reads |

Only `pumpkin-api` mode can close the Admin persistence gate, and only after isolated binding/deployment and Admin readback are separately approved and proven.

