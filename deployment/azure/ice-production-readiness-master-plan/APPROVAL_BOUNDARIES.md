# Approval Boundaries

Generated: 2026-06-04

## Allowed Without Further Approval

The following are safe planning/preflight actions:

- read safe docs
- create or update planning docs
- inspect repo status
- run non-deploying local validators
- create future prompts
- parse manifests
- run whitespace, secret, generated-artifact, and protected-path scans

## Requires Explicit Approval

The following require explicit approval before starting:

- creating Azure resources
- creating Cosmos resources
- creating Blob containers
- uploading media
- changing Cloudflare DNS or cache settings
- updating CMS records
- updating MediaAsset records
- deploying a form endpoint
- sending test email
- touching Microsoft 365
- setting production secrets
- deploying to Azure staging
- production cutover
- enabling production indexing
- touching Roller

## Always Disallowed In Planning-Only Runs

- reading protected config
- printing secrets, API keys, JWTs, tokens, credentials, storage keys, connection strings, SMTP credentials, or Microsoft 365 credentials
- staging generated static artifacts
- using `git add -A`

## Current Run Result

Planning docs were created only. No execution approval was used.

