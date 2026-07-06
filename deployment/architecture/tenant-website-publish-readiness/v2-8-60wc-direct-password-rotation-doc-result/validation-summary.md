# Validation Summary

Status: completed_for_blocked_closeout.

Completed:

- Redacted proof file exists.
- Redacted proof JSON parse passed.
- Redacted proof raw secret/hash pattern scan passed with 0 hits.
- Hardcopy TXT/JSON/SHA files exist.
- Hardcopy JSON SHA-256 matched expected value.
- Hardcopy TXT SHA-256 did not match the prompt-provided expected value.
- Hardcopy contents were not read or copied.
- Runtime no-regression was not run because checksum mismatch is a hard stop.
- No Codex password rotation, deploy, DNS, contact, form, media, content, user, role, tenant, key, SAS, or Key Vault action occurred.

Final validation/guard scan:

- Required result files exist: pass.
- Durable docs exist: pass.
- Root report exists: pass.
- Redacted proof JSON parse: pass.
- `result-manifest.json` parse: pass.
- Hardcopy TXT/JSON/SHA files exist: pass.
- Hardcopy JSON SHA-256 matches expected value: pass.
- Hardcopy TXT SHA-256 matches expected value: fail, blocked.
- `git diff --check` on V2.8.60WC paths: pass.
- Trailing whitespace scan on V2.8.60WC files: pass.
- Repo report/source secret-like scan: pass, 0 hits.
- Raw password/hash repo-output scan: pass, 0 hits.
- Disallowed command-shaped scan: pass, 0 hits.
- Protected-path guard: pass.
- Hardcopy staging verification: pass, no hardcopy files staged.
- `.tmp` staging verification: pass, no `.tmp` files staged.
- Final staging state: pass, no files staged.
- Cleanup state: `.tmp/v2-8-60wc/operator-proof` retained because checksum reconciliation is blocked.
