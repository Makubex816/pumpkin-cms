# Hard Copy Verification Status

Verification method: path, outside-repo location, and SHA-256 only, except for one bounded in-memory credential extraction attempt for Admin API proof.

- Hard-copy file exists: true.
- Checksum file exists: true.
- File is outside repo: true.
- Expected SHA-256: `f12c6f8f2afb0da7fbac0788477195e3269b3eeec34c361da7b3b50369ce004d`.
- Observed SHA-256: `f12c6f8f2afb0da7fbac0788477195e3269b3eeec34c361da7b3b50369ce004d`.
- SHA-256 matches: true.
- Secret values printed: false.
- Secret values written to repo reports: false.
- File copied into repo: false.
- File staged: false.

Admin proof extraction result:

- In-memory hard-copy read attempted: true.
- Email-like field found: true.
- Password field extracted: false.
- Admin login attempted: false.
- Classification: `admin_credentials_not_extracted_from_hard_copy`.
