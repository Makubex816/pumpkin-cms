# Rollback Notes

Generated: 2026-06-05

## Current Safety State

The endpoint is still in dry-run/no-email mode.

The first rollback lever remains:

```text
STATIC_FORM_FORWARD_MODE=dry-run
FORM_DELIVERY_MODE not active for graph
```

## Code Rollback

If the Graph-capable code package must be removed later, redeploy the prior no-email-only package or the prior approved source revision to the same Function App after explicit approval.

## Disable Options

Future approved disable options:

- keep dry-run/no-email mode
- restrict allowed origins
- restrict allowed site keys
- stop the Function App

No static route, media, DNS, Cloudflare, CMS, or MediaAsset rollback is required for this dry-run code redeploy.

