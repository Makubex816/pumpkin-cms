# Current State Summary

Phase status: `partial_live_state_stopped_no_rollback_tenantadmin_email_conflict`.

| Item | Current state |
|---|---|
| Tenant `strip-club-near-me-vegas` | created, active for controlled Admin use |
| TenantAdmin `steviedog2002@gmail.com` | not created; HTTP 409 global email conflict |
| Existing email assignment | `airstrip-club-las-vegas`, active `TenantAdmin` |
| Media container | `strip-club-near-me-vegas-media`, private, preserved |
| Canonical blobs | 302 / 302, 28,343,976 bytes, zero missing or zero-byte |
| Pages / redirects | 0 / 0 imported |
| Theme | 0 imported |
| FormDefinitions / mappings | 0 / 0 imported |
| MediaAsset / alias records | 0 / 0 imported; 473 remain pending |
| Club / guide records | 0 / 0 imported |
| Domain / audit metadata | 0 / 0 imported |
| Public launch | held |
| Destructive rollback | not performed |

The tenant and container must not be recreated or deleted during a resume. The immutable V2.8.62CR package remains the import source.
