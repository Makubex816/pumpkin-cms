# Remaining Risks

Generated: 2026-06-04

## Production Readiness Risks

- media production URL readiness is no
- contact form production readiness is no
- static output quality gates are no
- Azure staging readiness is no
- DNS cutover readiness is no
- production/indexing readiness is not live-ready

## Media Risks

- production media storage is not provisioned
- Blob containers are not created
- media binaries are not uploaded
- MediaAsset public URLs are not updated
- Cloudflare media hostname is not configured
- local `/media/...` URLs remain in body/page output

## Form Risks

- endpoint is missing and unverified
- no production static endpoint URL is configured
- no endpoint backend verification has passed
- no email delivery path is approved
- Microsoft 365 settings have not been touched

## Infrastructure Risks

- Azure staging resources are not created
- no staging deployment has occurred
- DNS rollback values are not recorded in this package because account-specific values should stay outside repo docs
- Cloudflare cache and bypass rules are not configured

## Operational Risks

- generated static artifacts must not be committed
- secrets must stay out of repo, chat, reports, and handoff archives
- production cutover must not proceed without rollback readiness
- Roller remains paused and must not be touched

## Current Run Result

No new production risk was introduced because this run created planning docs only.

