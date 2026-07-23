# Rollback, backup, and no-regression

## Preserved rollback evidence

- pre-productization backup manifest SHA-256: `6647b23f3d63af719d3c7b9beaf2a788e37eb2b29a08756dd0128cb5e1eff5d0`;
- backup checksum-ledger SHA-256: `fc9c4a71e33c9bd06d7d683a516c754a61e94c9a25a217bdb456687d140c1e2e`;
- A02 artifact/manifest: `227512fe26000e0fa933da51ec41a83e274cbb38b24bf15624de0b142271b4dd` / `80c9db24ab57d537e11eb86bfadb8d4e58f7cef87bf0c59978617c2224d98e54`;
- safe no-post artifact/manifest: `33122aab2b9f64567f2d1bf29d175c232f2b3c1715237fe5a49c04c75697e769` / `46bccba3f29081946d235fcb15b07a73f43703dfde4f41e648cffd27033b4517`.

The generic product source models release rollback, publication revoke/restore, exact artifact rollback, reverse job rollback, resume after partial success, and DPAPI provider recovery/rotation handoff. No live restore was run.

## Preservation baseline

Entry readback recorded 5 tenants (4 non-synthetic), 7 user accounts (6 non-synthetic), 9 memberships (8 non-synthetic), 5 contacts (4 non-synthetic), 13 FormEntries (12 non-synthetic), 36 FormDefinitions (35 non-synthetic), and 1 public publication. The non-synthetic tenant digest was `f29cabcc57062526642d65361d77fc2fc5bd52da5a1196643785ea16fb2b5d0`; the non-synthetic FormEntry digest was `278fbd2cf58846cbe485e814107e066d321b457f8187f04d413a4b76c3f30500`.

PUB-30 performed no live write, deployment, form POST, email, domain/DNS/TLS action, indexing change, Airstrip request, capacity change, or token rotation. The read-only diagnostic exposure does not itself mutate those baselines. Final post-recovery production readback is `NOT_PERFORMED_SECURITY_GATE`; this package does not substitute absence of writes for a completed live no-regression suite.
