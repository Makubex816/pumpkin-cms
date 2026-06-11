# Backup Center Staging Binding Result

No Backup Center staging resource binding is active after V2.3.2.

Candidate storage binding:

| Field | Candidate value | Status |
| --- | --- | --- |
| Storage account | `pumpkincmsstgolm01` | not created |
| Backup evidence container | `backup-center-staging` | not created |
| Resource Registry evidence container | `resource-registry-staging` | not created |
| Runtime QA evidence container | `runtime-qa-staging` | not created |

Backup Center pre-write evidence remains required before any future OLM staging provider write.

