# Local Test Plan

Generated: 2026-06-04

## Scope

This is a plan only. No local endpoint server was started and no form submission was sent in this pass.

## Existing Local Foundation

The repo contains:

```text
deployment/static-azure/forms/static-form-endpoint/
```

Existing docs describe local dry-run mode for validation-only tests.

## Future Local Test Steps

After explicit approval:

1. Use the existing static form endpoint package.
2. Run its static checks.
3. Start local dry-run mode without forwarding to Pumpkin API.
4. Submit local/test-only payloads.
5. Confirm validation rejects malformed payloads.
6. Confirm sanitization strips unsafe values.
7. Confirm generic public error responses.
8. Confirm no real email is sent.
9. Confirm no Microsoft 365 settings are touched.

## Local Placeholder Policy

A local placeholder/stub may be used only for interaction or validation experiments.

It must not be used to:

- mark production readiness `yes`
- set `STATIC_FORM_ENDPOINT_VERIFIED=true`
- satisfy strict staging/production validators

## Not Performed

- no local server started
- no test payload sent
- no protected config read
- no endpoint deployed

