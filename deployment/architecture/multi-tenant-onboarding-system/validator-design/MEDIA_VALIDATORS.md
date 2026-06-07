# Media Validators

Validate:

- media IDs are unique
- every referenced media ID exists
- public media URLs use the selected deployment profile
- URLs are HTTPS
- URLs do not contain secret query strings or SAS tokens
- local `/media/...` paths are absent from production-ready output
- public HEAD or GET checks pass where allowed
- expected content type matches media kind
- media rollback owner is assigned

Media validators must not upload, delete, or mutate media unless a separate media gate is approved.

