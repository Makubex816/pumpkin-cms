# Next Azure Staging Approval Required

Generated: 2026-06-06

## Current State

The official fresh CMS-backed Ice export is verified. Routes, media, form endpoint wiring, and strict static/staging validators passed against fresh live-CMS output.

Azure staging readiness is still `no` because no Azure staging resource creation, configuration, upload, deployment, or validation occurred in this approval.

## Separate Approval Required

Request a new approval before any Azure staging action.

Suggested next approval:

```text
Approve Ice Azure staging only: using the freshly verified Ice CMS-backed static output and approved static form endpoint URL, prepare or deploy only the approved Azure staging target, verify staging routes/media/form wiring without sending a new valid email unless separately approved, rerun staging validators, and document rollback. No CMS writes, no MediaAsset writes, no Function setting changes, no Cloudflare/root/www DNS changes, no production deployment, and Roller remains paused.
```
