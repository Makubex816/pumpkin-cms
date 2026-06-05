# Next Media Delivery Approval Required

Date: 2026-06-05

## Current Status

Cloudflare credentials are present in the active shell, and the approved read-only zone/status audit is complete.

The zone is active, public nameserver propagation is visible, and the allowed DNS record safety audit confirms no `media.iceskatingrinkrentals.com` Cloudflare DNS record exists yet.

## Before Media Delivery Setup

A separate, explicit media-delivery approval is still required before any Cloudflare configuration is changed.

Do not print token values.

## Next Approval Shape

After explicit approval, a media-only Cloudflare execution approval should cover only:

- `media.iceskatingrinkrentals.com`
- DNS/proxy setup for the media hostname
- path rewrite from `/ice-rink-rentals/assets/*` to the Azure Blob container-backed origin path
- cache behavior for checksum-versioned media paths
- validation of all 9 public media URLs

Do not include:

- root/apex DNS cutover
- `www` DNS changes
- CMS writes
- MediaAsset writes
- deployment
- email/Microsoft 365 work
- Roller work
