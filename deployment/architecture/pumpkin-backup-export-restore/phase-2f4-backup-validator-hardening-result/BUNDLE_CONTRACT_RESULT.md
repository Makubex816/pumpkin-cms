# Bundle Contract Result

The standard backup bundle contract now requires:

- `manifestVersion: "0.2.0"`;
- `bundleContractVersion: "0.2.0"`;
- `validatorContractVersion: "0.2.0"`;
- `backupMode: "standard"`;
- `bundleFormat: "folder"`;
- `includesEscrow: false`;
- `checksumAlgorithm: "sha256"`;
- safe bundle-relative manifest paths;
- manifest file list matching actual generated content files;
- generated JSON envelopes with schema versions;
- redacted config inventory only.

The manifest excludes `manifest.json`, `checksums.sha256`, `VALIDATION_RESULT.md`, and `validation-result.json` from its content file list.
