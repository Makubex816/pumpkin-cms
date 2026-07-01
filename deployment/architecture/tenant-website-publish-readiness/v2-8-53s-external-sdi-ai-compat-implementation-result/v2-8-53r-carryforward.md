# V2.8.53R Carryforward

V2.8.53R established the external SDI-AI Pumpkin CMS repo as an immutable compatibility contract:

| Field | Value |
| --- | --- |
| Repo | `https://github.com/SDI-AI/pumpkin-cms` |
| Branch | `main` |
| Commit | `947cf05a1b6fbf1721bc3c112e1052f0c6c59b8a` |
| Local reference path | `C:\Users\User\Desktop\PumpkinCMS\external-reference\SDI-AI-pumpkin-cms` |

Carryforward gaps:

- missing public `POST /api/forms/{tenantId}/submit/{type}` compatibility route
- missing Admin FormEntry aliases under `/api/admin/forms/{tenantId}/entries`
- current live Cosmos container contract uses singular Pascal container names
- Ice/Roller-specific hard-coded assumptions must be isolated before any secondary tenant expansion

V2.8.53S closed the route gaps and documented the remaining tenant-expansion constraints.
