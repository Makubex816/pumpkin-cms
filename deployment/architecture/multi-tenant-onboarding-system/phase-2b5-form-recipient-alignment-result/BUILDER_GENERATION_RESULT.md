# Builder Generation Result

Updated builder files:

- `src/answers-validator.mjs`
- `src/package-generator.mjs`
- `src/package-preview.mjs`
- `src/support-packet-hardening.mjs`
- builder fixtures and tests

## Behavior

The builder now requires `leadRecipientRef` in form answers.

Generated `forms.json` now includes:

```json
{
  "leadRecipientRef": "example-event-leads",
  "recipientGroup": "example-event-leads",
  "staticEndpointRef": "PROFILE_MANAGED_STATIC_ENDPOINT"
}
```

The builder does not emit raw `recipient` email into generated `forms.json`.

## Guardrails

The builder fails before generation when:

- `leadRecipientRef` is missing
- `leadRecipientRef` has an unsafe format
- `leadRecipientRef` looks secret-like
- `recipientGroup` is present and conflicts with `leadRecipientRef`
- `domainRoutingKey` uses an unsafe format
- `staticEndpointRef` is not placeholder/profile-managed

## Support Evidence

`BUILDER_PACKAGE_SUMMARY.md` now shows safe form routing summaries such as:

```text
contact-form -> example-event-leads
```
