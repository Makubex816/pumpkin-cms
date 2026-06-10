# Validator

The validator reads generated scan output from `.tmp` and checks:

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
