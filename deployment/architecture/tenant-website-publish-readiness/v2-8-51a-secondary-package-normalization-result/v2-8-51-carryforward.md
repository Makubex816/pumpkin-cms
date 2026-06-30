# V2.8.51 Carryforward

V2.8.51 established the secondary tenant intake/dry-run lane and did not create a live tenant.

V2.8.51A used the approved candidate package intake path:

`C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\secondary-candidate`

Carryforward boundaries remained active:

- No live mutation.
- No deploy.
- No Azure command.
- No appsettings read/write.
- No DNS or indexing action.
- No contact POST or form submission.
- No Cosmos direct write.
- No media upload.
- No protected config, owner hard-copy, Key Vault, keys/listKeys, SAS, or connection string access.
- No secret printing or repo secret writes.
