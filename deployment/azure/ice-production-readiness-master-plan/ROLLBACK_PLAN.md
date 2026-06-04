# Rollback Plan

Generated: 2026-06-04

## Scope

Planning only. No deployment or DNS action occurred.

## Rollback Assets

Before any staging or production deployment, retain:

- previous known-good static artifact
- current release artifact
- commit SHA
- deployment timestamp
- DNS pre-change notes
- Cloudflare cache/purge notes
- media URL rollback availability
- CMS/MediaAsset change log

## Rollback Triggers

- live route fails
- media fails to load
- contact form fails in an approved production test
- sitemap/robots is incorrect
- wrong content or route appears
- DNS/HTTPS failure
- severe performance or cache issue

## Rollback Steps

After approval or under the pre-approved incident policy:

1. Revert DNS records to documented previous values if DNS caused the issue.
2. Re-upload or reselect the previous known-good static artifact if deployment caused the issue.
3. Keep previous media URLs available through rollback window.
4. Revert MediaAsset public URLs only under explicit approval if media metadata caused the issue.
5. Purge Cloudflare cache only if approved or required by incident policy.
6. Verify `/`, `/contact`, `/service-areas`, `/sitemap.xml`, and `/robots.txt`.
7. Record incident, root cause, and next action.

## Current Run Result

Rollback plan documented only. No rollback action occurred.

