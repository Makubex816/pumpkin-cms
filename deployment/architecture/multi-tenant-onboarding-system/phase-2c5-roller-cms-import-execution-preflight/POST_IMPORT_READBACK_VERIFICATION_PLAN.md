# Post-Import Readback Verification Plan

This plan is for a later approved CMS import execution. It is not executed in Phase 2C-5.

## Required Readback Checks

After a later CMS import writes records, the operator must verify from CMS readback only:

- Roller tenant exists in draft/preview scope.
- Roller site exists in draft/preview scope.
- Approved routes exist: `/`, `/contact`, `/service-areas`.
- Forbidden routes remain blocked: `/preview`, `/draft`, `/old-roller-rink-rentals`.
- Pages exist for all approved routes.
- Pages are draft or approved-for-preview only.
- Forms exist with `leadRecipientRef` and legacy `recipientGroup` compatibility.
- Form delivery remains `no-email` unless a later email-specific approval changes it.
- SEO exists with `noindex,nofollow`.
- Sitemap policy remains disabled until final gate.
- Theme/navigation settings exist.
- Redirect metadata is imported only if present and approved.
- Created/updated CMS IDs are captured.
- No static generation was triggered.
- No deployment was triggered.
- No Search Console or indexing action occurred.
- No live pages were published.

## Evidence Requirements

The readback evidence should include:

- redacted command summary
- CMS readback query names
- counts of records found
- created/updated ID list
- pass/fail status by entity type
- hard-stop confirmation
- operator signoff

## Failure Response

If readback fails:

1. Stop.
2. Do not run static generation or deployment.
3. Capture the failed check.
4. Capture created or updated IDs.
5. Request fix-forward or rollback approval.
