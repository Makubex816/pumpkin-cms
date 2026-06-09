# Operator Checklist

Before approving Ice full standard backup execution, the operator must confirm:

- [ ] Backup Center local tests pass.
- [ ] Phase 2F-7 preflight package is reviewed.
- [ ] Owner approves real Ice standard backup execution.
- [ ] Execution prompt forbids CMS writes, deployment, indexing, and live-page changes.
- [ ] Standard backup mode is selected.
- [ ] Escrow remains excluded unless separately approved.
- [ ] Required environment variables are present by name only.
- [ ] No protected config files will be read.
- [ ] Database export mode is approved.
- [ ] Database artifact encryption requirement is accepted.
- [ ] Media inventory mode is approved.
- [ ] Media blob copy/download is approved or explicitly deferred.
- [ ] Static evidence capture mode is approved.
- [ ] Output path is under an approved ignored/local backup output location.
- [ ] Production backup zips are not created unless separately approved.
- [ ] Restore validation target is local/sandbox dry-run only.
- [ ] Retention and cleanup expectations are documented.
- [ ] Raw `content-review` folders remain untouched.
- [ ] Ignored `.tmp` artifacts are not staged.
- [ ] Search Console/indexing remains hard-stopped.
- [ ] Live pages remain unchanged.

Execution must stop if any item required by the future approval is missing or ambiguous.
