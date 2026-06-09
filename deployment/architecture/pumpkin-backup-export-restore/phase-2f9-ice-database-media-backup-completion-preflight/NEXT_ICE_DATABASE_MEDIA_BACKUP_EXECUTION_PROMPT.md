# Next Ice Database/Media Backup Execution Prompt

Approve Phase 2F-10 Ice database/media backup completion execution only: using the Phase 2F-9 preflight package and Phase 2F-8 standard backup baseline, run presence-only env/tooling checks, then create only the owner-selected missing production-restore-proof artifacts for IceSkatingRinkRentals.com: the approved database backup/export artifact or platform backup evidence, and the approved media blob copy/download or private backup-storage evidence. Write outputs only under ignored Backup Center `.tmp` output or approved private backup storage, update manifest/checksum/validation/restore-plan reports, and produce a go/no-go recommendation for complete production restore proof. Do not read protected config, do not print or export secrets, do not create an encrypted escrow payload, do not restore into any real system, do not perform CMS writes, do not perform MediaAsset writes, do not deploy, do not modify Cloudflare/DNS/email/Search Console, do not publish live pages, and do not stage generated backup artifacts into Git.

Required owner selections before execution:

- database mode: platform evidence, BACPAC/export artifact, `sqlpackage` local export, or no database artifact;
- media mode: metadata-only, local blob copy, private backup-storage copy, or manifest-only evidence;
- output target: ignored local `.tmp` or approved private backup storage;
- retention/cleanup rule;
- whether Azure actions are approved for this execution.

