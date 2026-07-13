# Runtime-Key Dormant State Proof

The tenant record reports one active runtime-key hash metadata record, and the committed DRU handoff reports one approved provisioning attempt. This establishes provisioned state only.

Dormancy proof:

- starter `PUMPKIN_TENANT_ID` remains Party Pros, not Vegas;
- no Vegas starter appsetting exists;
- no appsetting mutation occurred;
- no runtime redirect lookup used the Vegas key;
- no form/contact POST used the key;
- no form submission or FormEntry occurred;
- no key read, rotation, regeneration, or hardcopy rewrite occurred.

The V2.8.62F preview plan requires no runtime-key activation.
