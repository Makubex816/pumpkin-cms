# Form Recipient Write Plan

## Current Evidence

The local package expects:

- form ID: `contact-form`;
- delivery mode: `no-email`;
- lead recipient reference: `roller-rink-leads`.

Phase 2E-2 found 0 mentions of `roller-rink-leads` in refreshed page/index scans. Dedicated recipient registry evidence remains inconclusive.

## Default Action

No form recipient write.

## Future Write Options

A future write-preflight may plan one of these paths:

1. Adopt existing recipient if a fresh read-only check or implementation review proves it exists.
2. Link contact form to `roller-rink-leads` if the recipient reference is non-secret and owner-approved.
3. Create a recipient record only under a separate explicit CMS write approval.
4. Keep form updates blocked if recipient storage remains unknown.

## Hard Stops

- No email sending.
- No Microsoft 365 work.
- No Function App setting changes.
- No secrets in docs or commands.
- No live form endpoint activation.

## Verification Requirement

Any later form write must include readback verification that the recipient ref is present only where expected and that no email delivery mode changed unexpectedly.
