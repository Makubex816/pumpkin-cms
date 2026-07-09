# V2.8.61OE Runtime Preview Readiness

V2.8.61OE is not ready to proceed as a normal preview phase because V2.8.61OD is partial.

Required recovery before preview:

- Approve a recovery-only OD continuation.
- Patch the contact page import payload to include consent, honeypot, and required hidden fields.
- Import remaining pages.
- Create MediaAsset records for the already uploaded `627` blobs.
- Run TenantAdmin login/scope proof.
- Run Ice after-count no-change proof.
- Run non-Airstrip runtime no-regression.

