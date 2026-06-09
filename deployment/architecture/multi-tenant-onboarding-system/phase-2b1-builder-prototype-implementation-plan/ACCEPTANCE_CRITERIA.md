# Acceptance Criteria

Future Phase 2B-1 implementation is accepted only when:

- CLI builder prototype exists in a clearly scoped local folder.
- `--answers` and `--out` are required.
- answers JSON parse and pre-generation validation are implemented.
- valid answers generate all required import package JSON files.
- generated package runs through the existing offline validator.
- support packet export works through validator integration.
- failed builder validation does not write package files.
- failed validator run exits non-zero and writes clear local reports.
- `--dry-run` writes no package files.
- overwrite protection is implemented.
- secret-like answers are rejected and not printed.
- test fixtures cover valid and invalid answers.
- package docs explain local-only usage.
- no tenant is created.
- no CMS, MediaAsset, Azure, Cloudflare, DNS, deployment, Function setting, email/Microsoft 365, Search Console/indexing, external check, protected config, or Roller action occurs.

This planning package itself is accepted when all required planning docs exist, `answers.example.json` parses, and local documentation checks pass.
