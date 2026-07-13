# Validation Summary

| Validation | Result |
| --- | --- |
| DRU committed baseline and DRT source commit | passed |
| Start branch and staged-file gate | passed |
| Credential/register/runtime-key path and hash checks | passed |
| Backup ACL and secret exclusion | passed |
| Database export and JSON parse | passed |
| Media 302 / 28,343,976 bytes / zero missing / zero zero-byte | passed |
| 329 backup checksums | passed, 0 failures |
| SuperAdmin read-only review | passed, 11 surfaces |
| TenantAdmin own scope | passed, 8 surfaces |
| Cross-tenant/platform denials | passed, 14/14 |
| Package-fidelity readback | passed, 20 checks |
| Runtime key dormant | passed |
| Preview-host decision | package-derived immutable fixture |
| Runtime no-regression | passed 39/39 |
| Airstrip requests | 0 |
| Form/contact POSTs | 0 |
| Deploy/appsetting/DNS/TLS/publish/index actions | 0 |

Final repository syntax, JSON, whitespace, secret-like, path/payload, command-shaped, diff, required-file, and staging checks are run after generation by the scoped V2.8.62E validator. No file is staged by this generator.
