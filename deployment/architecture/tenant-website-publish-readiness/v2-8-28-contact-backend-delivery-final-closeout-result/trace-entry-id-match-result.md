# Trace And Entry ID Match Result

Date: 2026-06-26

## Expected Values

- Expected trace ID: `v2-8-26-production-contact-20260626101926`
- Expected entry ID: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`

## Operator-Provided Values

- Operator-provided trace ID: `v2-8-26-production-contact-20260626101926`
- Operator-provided entry ID: `ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`

## Match Result

- Trace ID matches expected: true
- Entry ID matches expected: true
- IDs identify the V2.8.26 production contact submission: true

## Gate Impact

The trace and entry ID comparison passes. The gate cannot close because operator backend delivery confirmation is `false`, not because of an ID mismatch.

