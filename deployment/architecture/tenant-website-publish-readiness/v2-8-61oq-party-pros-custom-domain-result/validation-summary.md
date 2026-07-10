# Validation Summary

Status: passed with TLS carryforward.

Validation run:

| Check | Result |
| --- | --- |
| OP committed | passed, `570f68e1` |
| No staged files at start | passed |
| Public NS propagation | passed across `1.1.1.1`, `8.8.8.8`, `9.9.9.9` |
| Public DNS records | passed |
| Azure DNS direct readback | passed |
| App Service prebinding readback | passed |
| Source discovery | host routing was missing |
| Host routing implementation | passed |
| `npm run type-check` | passed |
| `npm run build` | passed with known `fs` warning |
| Standalone package local host-header proof | passed |
| Single starter redeploy | passed |
| Custom hostname binding | passed |
| Managed TLS | attempted, not bound |
| Default starter host proof | passed |
| Custom-domain HTTP route proof | passed |
| Custom-domain HTTPS route proof | skipped, TLS not active |
| Form no-POST proof | passed |
| Non-Airstrip no-regression | passed |
| Required result files | passed |
| `result-manifest.json` parse | passed |
| `git diff --check` | passed |
| Trailing whitespace scan | passed |
| Secret-like scan | passed; only negated `listKeys/SAS` boundary text was found |
| Command-shaped scan | passed; only approved deploy/hostname/TLS command-class documentation and boundary text found |
| End staged-file check | passed; no files staged |

Remaining blocker:

- App Service managed TLS is not active for `partyrentalphiladelphia.com` or `www.partyrentalphiladelphia.com`.
