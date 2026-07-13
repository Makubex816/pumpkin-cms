# Restore Readiness Plan

Status: restore-ready documentation passed; no live restore performed.

## Preconditions

1. Verify both manifest hashes and all 329 file checksums.
2. Parse every JSON export and confirm tenant ID `strip-club-near-me-vegas`.
3. Choose an explicit target policy: new-tenant restore after absence proof, or separately approved disaster-recovery reconciliation for an existing tenant. Never blindly overwrite this active tenant.
4. Require a fresh backup of any existing target before an approved merge/replace operation.
5. Keep public launch, indexing, forms, DNS, TLS, and deploy held throughout restore validation.

## Restore Order

1. Validate and stage 302 canonical media files by canonical path, byte count, and SHA-256. Do not overwrite a hash mismatch.
2. Create or reconcile the Tenant record under the approved existence policy.
3. Restore the Theme/config record, including catalog records, article records, accepted deviations, runtime holds, and the 473-alias resolver metadata.
4. Restore 302 MediaAsset records, then reconstruct all 473 source-path aliases and verify each canonical URL/path.
5. Restore 32 FormDefinitions, then their 65 instance mappings. Keep every definition draft and no-post.
6. Restore 43 pages with their held SEO/workflow/deployment state and current revision metadata.
7. Restore the one page-owned redirect with its owning page. Validate both generic redirect payloads against the restored route graph before creating the two tenant redirect records.
8. Restore the held domain metadata, then held import and publish audit records. Do not bind domains or deploy.
9. Re-run count, identity, content-digest, redirect, media, form, and hold checks before any later preview action.

## Credential Boundary

TenantAdmin password material and runtime-key plaintext are intentionally excluded. Restore only sanitized TenantAdmin metadata from this backup. Any account access or runtime-key recovery requires the separate restricted handoff or an owner-approved rotation. Do not copy a credential value into a restore package, log, command, or repo file.

## Completion Gate

A restore is incomplete until all counts, hashes, aliases, forms, redirects, accepted deviations, and launch holds match. Public publication remains a separate approval even after a successful restore.
