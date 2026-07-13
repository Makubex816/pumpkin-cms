# Storage Account Public Access Readback

The `iceskatingmedia` account reported `allowBlobPublicAccess: true` and provisioning state `Succeeded` before the container change. The same values were read back after the change and after deployment.

The account-wide setting was not mutated. Azure Activity Log showed one successful storage write in the phase window, a `Put blob container` operation against only `strip-club-near-me-vegas-media`.
