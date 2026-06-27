# Isolated Staging Binding Validation Plan

This plan is for a later phase only.

Required approval:

- Approve isolated staging app-setting binding.
- Approve isolated staging deployment.
- Approve exactly one isolated no-PII synthetic contact POST after binding is deployed.

Planned validation:

1. Bind the non-secret and protected app-setting names from `protected-binding-contract.md` to an isolated staging target only.
2. Deploy the compat API package to the isolated staging target only.
3. Verify local package checks before any deployment command.
4. Send one approved isolated no-PII POST to `/api/static-contact`.
5. Confirm response `200`, `ok:true`, and returned `entryId`.
6. Confirm Admin readback in the same isolated backend shows the exact returned `entryId` and trace data.
7. Record no production endpoint call and no production POST.

Do not perform this plan during V2.8.31.

