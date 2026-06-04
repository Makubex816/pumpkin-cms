# Azure Staging Gate

Generated: 2026-06-04

## Goal

Azure staging must prove the static Ice site works on an Azure-hosted origin before live DNS/cutover.

## What Staging Must Prove

- `/` loads correctly
- `/contact` loads correctly
- `/service-areas` loads correctly
- `/sitemap.xml` and `/robots.txt` are correct
- static assets load without 404s
- media URLs use approved production/staging media URLs
- form behavior is correct for the configured staging endpoint
- canonical and noindex behavior is understood
- no secrets appear in source
- rollback artifact is available

## Required Prerequisites

Before Azure staging deployment:

- media readiness should be complete, or a staging-only exception must be explicitly approved
- form endpoint readiness should be complete, or a staging-only exception must be explicitly approved
- strict validators should pass, or remaining staging-only classifications must be explicitly approved
- generated static artifacts must be created intentionally and not committed
- staging resource creation must be explicitly approved

## App Settings And Secrets

Use placeholders only in docs:

- static form public endpoint placeholder
- static form verified flag placeholder
- Azure deployment token placeholder
- Azure resource name placeholder

Secrets must stay out of git, chat, reports, and handoff archives.

## Blocked Status

Azure staging readiness: no.

Deployment remains blocked until explicit approval.

No Azure resource or staging deployment occurred in this run.

