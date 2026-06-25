# Next Phase Prompt

Approve V2.8.19D Azure media upload approval resolution and optional scoped readback planning only.

Use the V2.8.19C result package:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-19c-corrected-ppec-logo-final-upload-manifest-result/
```

Use upload staging root:

```text
C:\Users\User\Desktop\PumpkinCMS\ice-site-recovery-intake\azure-upload-staging\v2-8-19b
```

Current approval state:

- Recovered originals approved: true.
- PPEC logo replacement approved: true.
- Contact replacement assets approved: false.
- Azure upload execution approved: false.

V2.8.19D must not execute upload unless the operator explicitly changes Azure upload execution approval to true.

If upload execution is approved in V2.8.19D:

- Upload only approved rows with `readyForUpload: true`.
- Exclude contact replacement rows unless contact replacement approval changes.
- Read back uploaded blob metadata after upload.
- Do not print secrets, keys, connection strings, SAS, or tokens.
- Do not deploy SWA.
- Do not mutate DNS/custom domains.
- Do not run Search Console/indexing.
- Do not submit contact forms.
- Do not crawl production.
- Do not stage upload-staging media files into git.

Not approved unless separately stated:

- SWA deploy.
- Production-bound deploy.
- Isolated staging deploy.
- Source integration.
- Contact replacement upload before owner approval.
