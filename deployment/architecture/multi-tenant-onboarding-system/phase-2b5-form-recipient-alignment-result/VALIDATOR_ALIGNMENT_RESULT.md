# Validator Alignment Result

Updated validator files:

- `src/error-codes.mjs`
- `src/error-explanations.mjs`
- `src/index.mjs`
- `src/support-packet-writer.mjs`
- `src/validators/form-reference-validator.mjs`
- validator fixtures and tests

## Behavior

The validator now:

- accepts `leadRecipientRef`
- accepts legacy `recipientGroup`
- requires `leadRecipientRef` or `recipientGroup` for each form
- flags unsafe recipient reference values
- flags secret-like recipient reference values through the secret scan
- flags conflicting `leadRecipientRef` and `recipientGroup`
- resolves page/block lead recipient references against `leadRecipientRef` or `recipientGroup`
- includes safe form recipient refs in the support packet and operator handoff

## New Error Codes

- `FORM_RECIPIENT_REFERENCE_REQUIRED`
- `FORM_RECIPIENT_REFERENCE_INVALID`
- `FORM_RECIPIENT_REFERENCE_CONFLICT`

## Support Evidence

`OPERATOR_HANDOFF.md` now includes:

```text
Recipient references: contact-form -> example-event-leads
```

No email is sent and no endpoint is contacted.
