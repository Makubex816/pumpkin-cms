# Override Policy

## Policy Name

`pausedTenantDryRunApproval`

## Allowed Shape

```json
{
  "tenant": "roller-rink-rentals",
  "primaryDomain": "rollerrinkrentals.com",
  "approvedScope": "local-offline-dry-run-only",
  "externalMutationsAllowed": false,
  "livePagesApproved": false,
  "livePagesHardStopped": true,
  "searchConsoleApproved": false,
  "searchConsoleIndexingHardStopped": true,
  "approvedByOwner": true
}
```

## Required Context

The approval only passes when the answers/package also proves:

- tenant ID, site key, and CMS slug are `roller-rink-rentals`
- primary domain is `rollerrinkrentals.com`
- generator mode is `offline-local-only`
- robots are `noindex,nofollow`
- sitemap is `disabled-until-final-gate`
- indexing final gate is true
- indexing approval is `blocked-until-final-review`

## Failed Overrides

Tests prove these cases fail:

- Roller reference without approval
- generic paused-tenant approval
- mismatched tenant/domain approval
- external mutations allowed
- live pages approved
- Search Console approved

## Scope Limit

This is not a general paused-tenant override. It is a narrow local/offline Roller dry-run allowance.
