# V2.8.45C Carryforward

V2.8.45C stopped before isolated deployment because static output and staging package validation failed on approved live media URLs.

Carryforward facts:

- No isolated SWA deploy occurred in V2.8.45C.
- No production SWA deploy occurred in V2.8.45C.
- Managed API route readiness passed before the media-origin validation blocker.
- No contact POST, content write, appsetting mutation, DNS/indexing, Pumpkin API deploy, Admin UI deploy, diagnostic/storage rollback, key/listKeys/SAS/connection string generation, or secret printing occurred.

V2.8.45D used the updated secure-file instruction and did not require or read the older V2.8.45B handoff.
