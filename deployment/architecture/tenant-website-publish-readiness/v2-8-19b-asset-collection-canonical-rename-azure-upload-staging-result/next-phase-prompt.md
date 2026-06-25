# Next Phase Prompt

Approve V2.8.19C scoped Azure media upload and readback verification only.

Use the V2.8.19B result package:

```text
deployment/architecture/tenant-website-publish-readiness/v2-8-19b-asset-collection-canonical-rename-azure-upload-staging-result/
```

Use upload staging root:

```text
C:\Users\User\Desktop\PumpkinCMS\ice-site-recovery-intake\azure-upload-staging\v2-8-19b
```

Approved for V2.8.19C only if explicitly confirmed by the operator:

- Upload only manifest-listed files with `readyForUpload: true`, unless owner separately approves contact replacements.
- Keep `uploadApproved` false in V2.8.19B records; V2.8.19C may create its own upload/readback result.
- Verify uploaded blob names, sizes, content types, and readback metadata.
- Do not print keys, connection strings, SAS, deployment tokens, or protected config.
- Do not deploy to SWA.
- Do not mutate DNS/custom domains.
- Do not run Search Console/indexing.
- Do not submit contact forms.
- Do not crawl production.
- Do not run live outbound URL checks except readback checks for the uploaded Azure media objects explicitly approved in V2.8.19C.
- Do not stage upload-staging image files into git.

Not approved unless separately stated:

- SWA deploy.
- Production-bound deploy.
- Isolated staging deploy.
- Source integration.
- Contact replacement upload before owner approval.
- PPEC logo upload before a valid source is provided or approved.
