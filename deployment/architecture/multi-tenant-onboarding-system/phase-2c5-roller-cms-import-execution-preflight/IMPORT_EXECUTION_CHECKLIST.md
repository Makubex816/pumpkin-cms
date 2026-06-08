# Import Execution Checklist

This checklist is for a later CMS import execution approval. It is not approved now.

## Before Asking For Import Execution Approval

- [ ] Phase 2C-4 CMS import plan reviewed.
- [ ] Phase 2C-5 preflight package reviewed.
- [ ] CMS read-only preflight separately approved and completed.
- [ ] Env presence evidence shows required variables as `PRESENT` where applicable.
- [ ] No secret values were printed or copied into evidence.
- [ ] Offline validator passed against the approved Roller package.
- [ ] CMS read-only preflight found no blocking conflicts.
- [ ] Approved package path is unchanged from the Roller dry-run evidence.
- [ ] Rollback owner is named.
- [ ] Evidence output path is named.
- [ ] CMS scope is draft/preview only.
- [ ] Live pages remain hard-stopped.

## During Later CMS Import Execution

- [ ] Confirm exact approval wording.
- [ ] Confirm operator identity and timestamp.
- [ ] Confirm package path.
- [ ] Confirm validation evidence path.
- [ ] Confirm read-only preflight evidence path.
- [ ] Confirm CMS draft/preview scope.
- [ ] Confirm excluded systems.
- [ ] Start importer in explicit execution mode only.
- [ ] Create or verify tenant shell.
- [ ] Create or verify site shell.
- [ ] Import route allowlist and forbidden routes.
- [ ] Import pages.
- [ ] Import forms.
- [ ] Import SEO and redirects.
- [ ] Import theme/navigation settings.
- [ ] Capture created or updated IDs after each step.
- [ ] Run CMS readback verification.
- [ ] Write redacted execution evidence.
- [ ] Stop before static generation, deployment, external systems, Search Console, indexing, and live pages.

## Abort Conditions

- [ ] Approval wording is missing, vague, or names the wrong tenant.
- [ ] Env presence check is missing or prints values.
- [ ] Validation is not passed with 0 errors.
- [ ] CMS read-only preflight finds conflicting existing records.
- [ ] Importer cannot prove draft/preview-only scope.
- [ ] Importer cannot capture created/updated IDs.
- [ ] Any command asks for MediaAsset, Azure, Cloudflare, DNS, deployment, email, Search Console, indexing, external checks, or live pages.
- [ ] Protected config must be read to proceed.
