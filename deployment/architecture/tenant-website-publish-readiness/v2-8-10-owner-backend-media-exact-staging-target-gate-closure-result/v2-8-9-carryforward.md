# V2.8.9 Carryforward

V2.8.9 carried these facts into V2.8.10:

| Carryforward item | State entering V2.8.10 |
| --- | --- |
| Local static integrity | passed |
| Candidate endpoint | configured for local validation only |
| Static form gate | `blocked_owner_approval_missing` |
| Endpoint owner approval | missing |
| Backend verification | missing |
| Contact-form owner approval | unresolved |
| Media/content final approval | unresolved |
| Exact staging target | unresolved candidate platform only |
| DNS/indexing/live publication | closed |

V2.8.10 moved the validator gate forward by recording local/staging-readiness owner approval from the current prompt. The validator now reports `blocked_backend_verification_missing`.

