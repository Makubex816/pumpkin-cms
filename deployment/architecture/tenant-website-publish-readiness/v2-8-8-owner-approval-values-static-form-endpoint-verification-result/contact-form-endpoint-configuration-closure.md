# Contact Form Endpoint Configuration Closure

State: unresolved; candidate recorded.

Safe candidate:

| Field | Value | Source |
| --- | --- | --- |
| Endpoint URL | `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` | `deployment/azure/ice-static-form-real-email-delivery-preflight/manifest.json` |
| Endpoint mode | `dry-run` | `deployment/azure/ice-static-form-real-email-delivery-preflight/manifest.json` |

Current-session endpoint input state:

| Variable family | State |
| --- | --- |
| `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` / `STATIC_FORM_ENDPOINT` / action aliases | absent |
| owner approval flags | absent |
| backend verification flags | absent |
| live-check approval flag | absent |

Closure result:

The endpoint value is known as a safe non-secret candidate, but it was not supplied as an approved build value in the current session and no owner approval record was present. V2.8.8 therefore did not wire it into a durable config file and did not treat it as staging-ready.
