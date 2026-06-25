# Pumpkin Tenant Website Publish Readiness V2.8.19C Corrected PPEC Logo Final Upload Manifest Report

Phase status: complete corrected PPEC logo capture and final no-write Azure upload manifest packet.

Lane: V2.8 Tenant Website / Public Website Regression Recovery.

Classification: `corrected_ppec_logo_capture_final_upload_manifest_no_azure_write_no_deploy`.

No Azure media upload, Azure mutation, or deploy was performed in V2.8.19C.

## Summary

V2.8.19C corrected the missed PPEC/Party Pros logo handling from V2.8.19B. The visible external logo candidate was found automatically as:

```text
C:\Users\User\Desktop\PumpkinCMS\ice-site-recovery-intake\media-binaries\logo_foot.png
```

It was copied, not moved, to the approved outside-repo selected-candidate path:

```text
C:\Users\User\Desktop\PumpkinCMS\ice-site-recovery-intake\azure-media-candidates\selected\v2-8-19c\party-pros-east-coast-logo.png
```

It was also copied, not moved, to the canonical outside-repo upload-staging path:

```text
C:\Users\User\Desktop\PumpkinCMS\ice-site-recovery-intake\azure-upload-staging\v2-8-19b\ice-rink-rentals\partners\party-pros-east-coast-logo.png
```

## Key Results

- PPEC logo candidate found: yes.
- PPEC candidate source filename: `logo_foot.png`.
- PPEC candidate SHA-256: `51DF67C825CA2F4E59C23057BDCD0543015FE8AE7F2FEBE38F7ADE932CBB9577`.
- PPEC candidate dimensions: `524x727`.
- PPEC selected-candidate copy outside repo: yes.
- PPEC upload-staging copy outside repo: yes.
- Final upload-staging image files: `11`.
- Final upload-staging bytes: `34478542`.
- Final canonical asset slots with staged files: `11`.
- Owner-approved staged assets: `8`.
- Contact replacement staged assets still not owner-approved: `3`.
- Azure upload execution approved: false.

## Owner Approval State

Recovered originals are owner-approved for the later upload approval packet. The PPEC logo replacement is owner-approved because the operator approved the visible logo candidate and it was found and validated.

The three contact replacement assets remain not approved because `contactReplacementAssetsApproved` is false. Azure upload execution is also still not approved because `ownerAllowsAzureMediaUploadNextPhase` is false.

## Boundary Confirmation

No SWA deploy, Azure media upload, Azure mutation, DNS/custom-domain mutation, Search Console/indexing action, token reset/print/use, protected config read, suspected secret content inspection, `.env.local` access, contact-form POST, production crawl, live outbound URL check, live publication, backup/archive copy into repo, selected-candidate copy into repo, upload-staging copy into repo, backup staging, upload-staging staging, selected-candidate staging, source integration, or image commit occurred.

Production boundary remains unchanged: `swa-ice-static-staging` is production-bound because real custom domains are attached, and `swa-ice-static-isolated-staging` remains the safe isolated staging target for a later separately approved phase.
