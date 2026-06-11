# Operator Checklist

Before using Resource Registry / Provider Profiles as operational controls:

- Start from `PUMPKIN_PLATFORM_SOURCE_OF_TRUTH.md`.
- Confirm current reference is V2.5.1 or newer.
- Run `npm run validate:operational-bindings` from the Resource Registry implementation package.
- Confirm validation has zero failures.
- Confirm `production-runtime` is blocked.
- Confirm `live-write-approved` is scoped-only and tied to an explicit approval/batch.
- Confirm credential references have `valueIncluded: false`.
- Confirm Resource Registry and Runtime QA staging containers exist before planning uploads.
- Keep generated `.tmp` evidence unstaged.
- Use exact-path `git add`; do not use `git add -A`.

Do not proceed if any validation failure appears or if a provider action would require protected config, keys, connection strings, SAS, RBAC changes, deployment, indexing, or publication.

