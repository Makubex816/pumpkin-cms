# Validation And Sanitization Result

The local endpoint package now validates or preserves validation for:

- request method
- JSON body shape
- body size
- allowed origin
- known site/tenant
- site/tenant mismatch
- required form data
- name
- email shape
- consent
- quote-request phone requirement
- quote-request location or message requirement
- honeypot/spam fields, including `honeypot`
- allowed routing refs
- allowed recipient refs
- message length, defaulting to 4000 characters

Sanitization remains in:

```text
deployment/static-azure/forms/static-form-endpoint/sanitize-static-form-payload.mjs
```

It strips control characters, strips angle brackets, normalizes field keys, trims values, and length-limits submitted values.

Public validation responses use generic error labels and do not echo unknown routing or recipient values.

Email sending was not added or tested.

