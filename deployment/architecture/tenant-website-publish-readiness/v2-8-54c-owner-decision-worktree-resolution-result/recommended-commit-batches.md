# Recommended Commit Batches

No files were staged by V2.8.54C. Use exact-path commits only.

## Batch 1 - V2.8.54C Owner Decision Resolution Reports

```powershell
git add -- `
  "PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_54C_OWNER_DECISION_WORKTREE_RESOLUTION_REPORT.md" `
  "deployment/architecture/tenant-website-publish-readiness/v2-8-54c-owner-decision-worktree-resolution-result/" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_OWNER_DECISION_WORKTREE_RESOLUTION_V2_8_54C.md" `
  "deployment/architecture/pumpkin-platform/PUMPKIN_PRE_PARTNER_TENANT_REPO_READINESS_V2_8_54C.md"
git diff --cached --name-only
git diff --cached --check
git commit -m "Add V2.8.54C owner decision worktree resolution"
```

## Batch 2 - Owner-approved completed phase artifacts

Use the candidate list in completed-phase-commit-candidates.md. Do not use blanket all-file staging. Create one commit per completed phase or tightly related phase family after owner review.

## Batch 3 - Owner-approved source/platform changes

Use the owner-decision-required register. Source/package changes under apps/ and platform source-of-truth changes should be reviewed and split from documentation-only evidence before any partner-tenant creation resumes.
