# Admin API Proof Status

Prior proof:

- V2.8.34A completed authenticated Admin FormEntry readback after corrected key rotation.
- The V2.8.34A production trace was Admin-visible: `v2-8-34a-production-key-rotation-20260629134931-bf80dd04`.

V2.8.35 current proof:

- Pumpkin API `/health`: HTTP 200.
- Pumpkin API `/api/health`: HTTP 200.
- Appsetting names required for JWT/provider/Cosmos are present and non-empty, values redacted.
- Owner hard-copy hash matched.
- In-memory credential extraction found an email-like field but did not extract a password field.
- Admin login attempted: false.
- Bearer token returned or printed: false.
- Admin readback attempted: false.

Classification:

`admin_api_prior_proven_not_revalidated_credentials_not_extracted_from_hard_copy`.

Next proof requirement:

Before Admin UI deployment or broader CMS validation, run a bounded Admin API auth/readback proof using approved credential handling and no secret output.
