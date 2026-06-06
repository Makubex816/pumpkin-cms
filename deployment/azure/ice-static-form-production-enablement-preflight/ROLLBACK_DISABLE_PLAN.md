# Rollback Disable Plan

Generated: 2026-06-06

## Immediate Rollback

Set:

```text
FORM_DELIVERY_MODE=no-email
```

This disables ongoing Graph sends while leaving the deployed endpoint and Graph settings available for future approved testing.

## Validator Rollback

If endpoint verification fails:

- unset `STATIC_FORM_ENDPOINT_VERIFIED`
- or set it to `false` in the relevant shell/context
- do not publish static output that was built with a failed endpoint gate

## Scope Boundaries

Rollback does not require:

- CMS content edits
- MediaAsset edits
- media delivery changes
- Cloudflare changes
- static deployment
- endpoint redeploy

