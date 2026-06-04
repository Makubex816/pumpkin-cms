# Future Codex Prompts

Generated: 2026-06-04

## Shared Guardrails For All Prompts

Each future prompt should preserve:

- work only from the local repo filesystem and terminal unless the phase explicitly approves external actions
- do not print secrets, API keys, JWTs, tokens, connection strings, provider credentials, SMTP credentials, Microsoft 365 credentials, storage keys, or Cosmos keys
- do not read protected config unless the prompt explicitly approves it
- do not touch Roller
- do not deploy unless explicitly that phase
- do not change DNS unless explicitly that phase
- do not stage generated static artifacts
- stage only expected files
- never use `git add -A`

## Production Media Setup Preflight

```text
Create a production media setup preflight for IceSkatingRinkRentals.com only. Read safe docs and inventories, verify the planned MediaAsset list, target media URL contract, validation steps, and exact approval boundaries. Do not create Azure resources, Blob containers, upload media, change Cloudflare, update CMS, update MediaAsset records, deploy, read protected config, print secrets, or touch Roller.
```

## Production Media Resource Creation

```text
With explicit approval for media infrastructure only, create or prepare the approved Azure media resources exactly as specified in the reviewed plan. Do not upload media, update CMS, update MediaAsset records, deploy the site, change DNS beyond the explicitly approved media resource scope, print secrets, read protected config outside the approved mechanism, or touch Roller.
```

## Media Upload And MediaAsset Update

```text
With explicit approval for Ice media upload and MediaAsset updates only, upload the approved media binaries, verify checksums, update only approved MediaAsset production fields, read back all records, rerun static export and strict validators, and document results. Do not change body content, form config, DNS, Azure staging, Microsoft 365, email, deployment, protected config, or Roller.
```

## Static Form Endpoint Preflight

```text
Create a static form endpoint preflight for IceSkatingRinkRentals.com only. Review safe endpoint docs, validation/sanitization requirements, allowed origins, env var placeholders, and approval boundaries. Do not deploy an endpoint, send email, touch Microsoft 365, set production env vars, read protected config, print secrets, update CMS, update MediaAsset records, or touch Roller.
```

## Static Form Endpoint Deployment

```text
With explicit approval for static form endpoint deployment only, deploy or configure the approved endpoint, run approved local/staging tests, verify backend behavior, and document whether STATIC_FORM_ENDPOINT_VERIFIED may be set. Do not send real email or touch Microsoft 365 unless separately approved. Do not deploy the static site, change DNS, update CMS, update MediaAsset records, print secrets, or touch Roller.
```

## Azure Staging Setup

```text
With explicit approval for Ice Azure staging setup only, prepare the approved Azure Static Web App staging target and required non-secret public settings. Do not change DNS, do not deploy to production, do not create unrelated resources, do not touch Roller, do not print secrets, and do not stage generated static artifacts.
```

## Staging Deployment And Smoke Test

```text
With explicit approval for Ice staging deployment and smoke test only, generate the Ice static package, run validators, deploy to the approved staging target, smoke test /, /contact, /service-areas, sitemap, robots, media, and approved form behavior, then document results. Do not change production DNS, do not cut over, do not touch Roller, and do not print secrets.
```

## DNS Cutover Preflight

```text
Create a DNS cutover preflight for Ice only. Read safe docs, summarize current required staging pass state, list DNS/canonical/cache/rollback requirements, and produce an approval checklist. Do not change Cloudflare or DNS, deploy, send email, read protected config, print secrets, or touch Roller.
```

## Production Cutover

```text
With explicit approval for Ice production cutover only, execute the approved DNS/cutover checklist, verify HTTPS and routes, run production smoke tests, document rollback readiness, and record results. Do not touch Roller, do not print secrets, do not perform unapproved CMS/MediaAsset writes, and do not send email unless separately approved.
```

