# V2.8.34 Carryforward

V2.8.34 result:

`controlled_static_contact_key_rotation_blocked_isolated_http_400_rollback_complete`

Carryforward facts:

- A fresh V2.8.34 key was generated but is inactive/rolled back.
- Isolated SWA was bound to the V2.8.34 key.
- Exactly one isolated POST returned HTTP 400.
- Isolated Admin readback did not find the trace after 5 polls.
- Production appsettings and production POST were not run.
- Tenant auth and isolated appsetting changes were rolled back.

Failed isolated trace:

`v2-8-34-isolated-key-rotation-20260629045108-9b13ff26`

V2.8.34A did not reuse the failed V2.8.34 generated key.
