# Provider State Result

Status: target ready, execution blocked.

Provider target state:

- staging resource group: present
- staging Cosmos account: present
- staging Cosmos database: present
- OLM containers: present
- partition key: `/tenantKey`
- RBAC assignment inventory: present

OLM execution provider state:

- provider profile validation: passed
- provider mode: `live-write-approved`
- staging execution gate: blocked
- gate code: `LIVE_WRITE_APPROVED_UNAVAILABLE`
- repo live write allowed: `false`

The provider target exists, but the repo does not yet have the approved live data-plane execution adapter needed to write to it.
