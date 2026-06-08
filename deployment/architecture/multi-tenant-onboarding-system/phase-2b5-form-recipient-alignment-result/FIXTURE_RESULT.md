# Fixture Result

## Builder Fixtures

Updated:

- `fixtures/example-event-rentals.answers.json`
- `fixtures/fake-pilot-example-event-rentals.answers.json`

Added:

- `fixtures/invalid-missing-lead-recipient-ref.answers.json`
- `fixtures/invalid-secret-like-lead-recipient-ref.answers.json`
- `fixtures/invalid-conflicting-recipient-reference.answers.json`

## Validator Fixtures

Updated:

- `fixtures/valid-minimal/forms.json`

The validator tests also create temporary fixture variants for:

- legacy `recipientGroup` only
- missing recipient reference
- secret-like `leadRecipientRef`
- conflicting `leadRecipientRef` and `recipientGroup`

## Fake-Pilot Output

The generated fake-pilot package includes:

```json
"leadRecipientRef": "example-event-leads",
"recipientGroup": "example-event-leads"
```

The fake-pilot package validates with 0 errors and 0 warnings.
