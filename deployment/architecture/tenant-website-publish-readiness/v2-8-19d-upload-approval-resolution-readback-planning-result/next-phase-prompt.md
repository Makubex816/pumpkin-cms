# Next Phase Prompt

Approve V2.8.19E Azure media upload target resolution and execution approval decision only.

Use the V2.8.19D result package:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-19d-upload-approval-resolution-readback-planning-result/
```

Use upload staging root:

```text
C:\Users\User\Desktop\PumpkinCMS\ice-site-recovery-intake\azure-upload-staging\v2-8-19b
```

Current approval state:

- Recovered originals approved: true.
- PPEC logo replacement approved: true.
- Contact replacement assets approved: false.
- Public contact email approved: true.
- Azure upload execution approved: false.

V2.8.19E must not execute upload unless the operator explicitly changes Azure upload execution approval to true and resolves all target execution values.

Resolve or confirm:

- Target storage account/provider.
- Target container.
- Target path prefix.
- Public base URL/CDN base.
- Auth/session mode, without printing secrets.
- Readback method.
- Cache-control policy.
- Overwrite policy.
- Whether the 3 contact replacement rows remain excluded.
- Whether future source integration must replace generic fallback email values with `contact@iceskatingrinkrentals.com`.

Not approved unless separately stated:

- Azure media upload.
- Azure mutation.
- SWA deploy.
- Production-bound deploy.
- Isolated staging deploy.
- DNS/custom-domain mutation.
- Search Console/indexing.
- Deployment-token reset, print, or use.
- Protected config read.
- `.env.local`, appsettings, or local settings read.
- Contact-form POST.
- Production crawl.
- Live outbound URL checks.
- Source integration.
- Upload-staging media staging or commit.
- Contact replacement upload before owner approval.
