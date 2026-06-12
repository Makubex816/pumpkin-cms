# V2.8.8 Carryforward

V2.8.8 carried these facts into V2.8.9:

| Carryforward item | State entering V2.8.9 |
| --- | --- |
| Sanitized no-dotenv build path | implemented |
| Static form validator hardening | implemented |
| Endpoint vs owner/backend classification | implemented |
| Safe no-email endpoint candidate | recorded |
| Backend verification | blocked |
| Contact-form owner approval | unresolved |
| Media/content approval | unresolved |
| Exact staging target approval | unresolved |
| DNS/indexing/live publication | closed |

V2.8.9 re-used the V2.8.8 hardened validators and applied the safe candidate endpoint only to local validation commands. That changed the final static form gate from `blocked_endpoint_missing` to `blocked_owner_approval_missing`, proving endpoint shape can now be validated while owner/backend evidence remains separate.

