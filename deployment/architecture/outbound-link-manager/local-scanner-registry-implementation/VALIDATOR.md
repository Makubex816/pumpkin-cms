# Validators

The scan validator reads generated scan output from `.tmp` and checks:

- required JSON files parse;
- registry records include tenant and site scope;
- instance records include tenant and site scope;
- instance records reference existing outbound links;
- link and instance statuses are allowed;
- normalized outbound URLs are `http` or `https`;
- relative/internal links are not classified as outbound;
- duplicate normalized URLs collapse into one registry record;
- scan run scope matches registry scope;
- output path stays under `.tmp`.

Command:

```powershell
node src/outbound-link-cli.mjs validate --scan .tmp/tenant-bundle-scan
```

The validator writes `VALIDATION_RESULT.json` into the scan output folder.

## Local Store Validator

The local store validator reads a file-backed store from `.tmp` and checks:

- store manifest exists;
- all required JSON files parse;
- envelopes, links, instances, policies, scan runs, and audit logs are tenant/site scoped;
- instances reference existing outbound links;
- link and instance statuses are allowed;
- normalized URLs remain web outbound URLs;
- duplicate normalized URLs do not exist within the same tenant/site;
- stale instances are disabled;
- active policy exists;
- blocked-domain policy effects are reflected in links and instances;
- merged links track `last_detected_at`;
- secret-like values are rejected;
- validation output stays under `.tmp`.

Command:

```powershell
node src/outbound-link-cli.mjs validate-store --store .tmp/local-store-merged
```

The local store validator writes `VALIDATION_RESULT.json` and `VALIDATION_RESULT.md` into the local store folder.
