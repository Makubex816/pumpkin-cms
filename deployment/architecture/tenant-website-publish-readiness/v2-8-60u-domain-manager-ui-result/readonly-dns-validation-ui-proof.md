# Readonly DNS Validation UI Proof

Status: passed.

Read-only DNS validation was triggered from the Domain Manager UI in isolated and production browser proof.

Result:

- DNS validation endpoint returned through UI successfully.
- Last validation result appeared in the UI.
- Displayed status remained `pending`.
- `allRecordsVerified` remained false.

Observed note:

- Public DNS still does not match the full required Azure App Service DNS packet, so V2.8.60V must wait for manual DNS correction and a later read-only validation.

No DNS provider mutation occurred.
