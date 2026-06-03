# Auth Lifecycle Result

- Env JWT initial status: MISSING
- Temp JWT initial status: PRESENT
- Auth presence: PRESENT
- Auth validation: VALID
- Temp JWT loaded from file: yes
- Temp JWT deleted immediately after load: no
- Temp JWT deleted after success: yes
- Temp JWT retained on failure: no
- Temp JWT final status: MISSING
- Cleanup reason: deleted after successful writes, readback verification, reports, and final hygiene checks
- JWT printed: no

Policy:

- Invalid auth retains the temp JWT.
- Pre-write validation failure retains the temp JWT.
- CMS write failure retains the temp JWT.
- Post-write verification failure retains the temp JWT.
- Successful write, verification, report, and final hygiene checks delete the temp JWT at the end.
