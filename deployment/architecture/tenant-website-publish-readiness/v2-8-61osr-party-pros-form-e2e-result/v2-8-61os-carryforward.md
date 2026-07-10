# V2.8.61OS Carryforward

V2.8.61OS is committed at `8597a05e`.

Carryforward:
- OR carryforward was verified at `fb03dd3d`.
- Party Pros HTTPS custom-domain prerecheck passed.
- The deployed Party Pros contact page remained preview-disabled/no-post.
- Local starter repair was committed so custom-domain host routes can render live-submit mode while `/preview/party-pros-philadelphia...` remains no-post.
- Starter type-check passed.
- Starter build passed with the existing shared model package `fs` warning.
- Preview no-post reproof passed.
- Runtime no-regression passed 23/23 GET-only checks.
- OS performed no tenant API key regeneration, appsetting mutation, deploy, contact POST, form submission, FormEntry creation/readback, external email, Airstrip, Ice mutation, DNS, registrar, TLS, storage key, listKeys, or SAS action.

OS blocker:
- `PUMPKIN_FORMENTRY_READBACK_AUTH_MODE=custom-header` was present.
- `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME` and `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE` were missing in the shell.
