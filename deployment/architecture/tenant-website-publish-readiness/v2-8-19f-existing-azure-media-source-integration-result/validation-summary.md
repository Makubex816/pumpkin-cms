# Validation Summary

Overall result: pass for local source integration and local validation.

Validation results:

| Check | Result |
| --- | --- |
| `npm run type-check` | Pass |
| `npm run build` | Pass with existing warnings |
| `npm run build:static:ice:sanitized` | Pass |
| Static validate inside sanitized build | Pass |
| Static generate inside sanitized build | Pass |
| Image reference string/map validation | Pass |
| Route/content source manifest validation | Pass |
| Required package inventory | Pass, 24 required files present |
| `result-manifest.json` parse | Pass |
| Source deploy/Azure-write/secret-like scan | Pass |
| Exact V2.8.19F binary/archive/path/write guard | Pass, 31 files checked |
| `node --check` for changed JS/MJS | Not applicable, no JS/MJS files changed |
| `git diff --check` on V2.8.19F source paths | Pass |
| Trailing whitespace scan on V2.8.19F source paths | Pass |
| Staged files check | Pass, no files staged |

Sanitized static build:

- Run ID: `sanitized_20260625053836`
- Protected config copied: false
- Protected config reference in output: false
- Static output generated in ignored local `.tmp` workspace.

Known warnings:

- Existing React hook dependency warning in draft preview client.
- Existing `<img>` warnings in polished block rendering.
- Existing `fs` resolution warning from the shared model package during plain Next build.

No validation required a deploy, Azure write, live URL fetch, contact-form POST, or production crawl.
